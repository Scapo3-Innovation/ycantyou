import { supabase } from '@/lib/supabase';
import type { CommunityComment, CommunityPost } from '@/types/database';

import { FEED_LIMIT } from './constants';
import type { FeedPost, PostComment } from './types';

/**
 * Community data layer.
 *
 * Security model (RLS-enforced): posts/comments are readable when not soft-deleted and
 * writable only by their author; likes are readable by all and writable only by their owner;
 * blocks and reports are owner-scoped. `user_id` always comes from the session.
 *
 * Blocking is applied here (filtering blocked authors out of feeds and comment lists) so a
 * block takes effect immediately and consistently.
 */

/** Ids the user has blocked. */
export async function fetchBlockedIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('community_blocks')
    .select('blocked_id')
    .eq('blocker_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => (r as { blocked_id: string }).blocked_id);
}

/** Newest posts with like/comment counts, excluding blocked authors. */
export async function fetchFeed(userId: string): Promise<FeedPost[]> {
  const blocked = new Set(await fetchBlockedIds(userId));

  const { data: postRows, error } = await supabase
    .from('community_posts')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(FEED_LIMIT);
  if (error) throw error;

  const posts = ((postRows ?? []) as CommunityPost[]).filter((p) => !blocked.has(p.user_id));
  if (posts.length === 0) return [];

  const ids = posts.map((p) => p.id);
  const [likeCounts, likedByMe, commentCounts] = await aggregateCounts(ids, userId);

  return posts.map((p) => ({
    ...p,
    likeCount: likeCounts.get(p.id) ?? 0,
    commentCount: commentCounts.get(p.id) ?? 0,
    likedByMe: likedByMe.has(p.id),
    isOwn: p.user_id === userId,
  }));
}

/** One query each for likes and (non-deleted) comments over the visible post ids. */
async function aggregateCounts(
  postIds: string[],
  userId: string,
): Promise<[Map<string, number>, Set<string>, Map<string, number>]> {
  const { data: likes, error: likeErr } = await supabase
    .from('community_likes')
    .select('post_id, user_id')
    .in('post_id', postIds);
  if (likeErr) throw likeErr;

  const { data: comments, error: commentErr } = await supabase
    .from('community_comments')
    .select('post_id')
    .in('post_id', postIds)
    .is('deleted_at', null);
  if (commentErr) throw commentErr;

  const likeCounts = new Map<string, number>();
  const likedByMe = new Set<string>();
  for (const row of (likes ?? []) as { post_id: string; user_id: string }[]) {
    likeCounts.set(row.post_id, (likeCounts.get(row.post_id) ?? 0) + 1);
    if (row.user_id === userId) likedByMe.add(row.post_id);
  }

  const commentCounts = new Map<string, number>();
  for (const row of (comments ?? []) as { post_id: string }[]) {
    commentCounts.set(row.post_id, (commentCounts.get(row.post_id) ?? 0) + 1);
  }

  return [likeCounts, likedByMe, commentCounts];
}

/** A single post (with its like state) plus its non-deleted, non-blocked comments. */
export async function fetchPostDetail(
  postId: string,
  userId: string,
): Promise<{ post: FeedPost; comments: PostComment[] } | null> {
  const { data: postRow, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  if (!postRow) return null;
  const post = postRow as CommunityPost;

  const blocked = new Set(await fetchBlockedIds(userId));

  const { data: likes, error: likeErr } = await supabase
    .from('community_likes')
    .select('user_id')
    .eq('post_id', postId);
  if (likeErr) throw likeErr;

  const { data: commentRows, error: commentErr } = await supabase
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  if (commentErr) throw commentErr;

  const likeRows = (likes ?? []) as { user_id: string }[];
  const comments = ((commentRows ?? []) as CommunityComment[])
    .filter((c) => !blocked.has(c.user_id))
    .map((c) => ({ ...c, isOwn: c.user_id === userId }));

  return {
    post: {
      ...post,
      likeCount: likeRows.length,
      commentCount: comments.length,
      likedByMe: likeRows.some((l) => l.user_id === userId),
      isOwn: post.user_id === userId,
    },
    comments,
  };
}

export async function createPost(
  userId: string,
  input: { title: string | null; body: string; tags: string[] },
): Promise<CommunityPost> {
  const { data, error } = await supabase
    .from('community_posts')
    .insert({ user_id: userId, title: input.title, body: input.body, tags: input.tags })
    .select('*')
    .single();
  if (error) throw error;
  return data as CommunityPost;
}

export async function addComment(
  userId: string,
  postId: string,
  body: string,
): Promise<CommunityComment> {
  const { data, error } = await supabase
    .from('community_comments')
    .insert({ user_id: userId, post_id: postId, body })
    .select('*')
    .single();
  if (error) throw error;
  return data as CommunityComment;
}

/** Soft-delete (sets deleted_at; all reads filter it out). */
export async function softDeletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('community_posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', postId);
  if (error) throw error;
}

export async function softDeleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('community_comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId);
  if (error) throw error;
}

/** Toggle a like (insert, or delete when already liked). */
export async function toggleLike(
  userId: string,
  postId: string,
  liked: boolean,
): Promise<void> {
  if (liked) {
    const { error } = await supabase
      .from('community_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('community_likes')
      .insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

export async function reportContent(
  userId: string,
  target: { postId?: string; commentId?: string },
  reason: string,
): Promise<void> {
  const { error } = await supabase.from('community_reports').insert({
    reporter_id: userId,
    post_id: target.postId ?? null,
    comment_id: target.commentId ?? null,
    reason,
  });
  if (error) throw error;
}

export async function blockUser(userId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('community_blocks')
    .insert({ blocker_id: userId, blocked_id: blockedId });
  if (error) throw error;
}
