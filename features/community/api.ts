import { supabase } from '@/lib/supabase';
import { isSchemaNotReadyError, schemaNotReadyMessage } from '@/lib/supabaseErrors';
import type { CommunityComment, CommunityPost } from '@/types/database';

import { FEED_LIMIT } from './constants';
import { resolveAuthorLabel } from './displayName';
import type { FeedPost, PostComment } from './types';

/**
 * Community data layer.
 *
 * Security model (RLS-enforced): posts/comments are readable when not soft-deleted and
 * writable only by their author; likes/dislikes are readable by all and writable only by
 * their owner; blocks and reports are owner-scoped. `user_id` stays server-side for
 * moderation/export — UI uses authorLabel only.
 */

type ProfileNameRow = { id: string; full_name: string | null };
type CommunityProfileRow = {
  user_id: string;
  is_trusted_contributor: boolean;
};

async function fetchProfileNames(userIds: string[]): Promise<Map<string, string | null>> {
  if (userIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);
  if (error) throw error;
  return new Map(
    ((data ?? []) as ProfileNameRow[]).map((row) => [row.id, row.full_name]),
  );
}

async function fetchTrustedStatus(userIds: string[]): Promise<Map<string, boolean>> {
  if (userIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from('community_profiles')
    .select('user_id, is_trusted_contributor')
    .in('user_id', userIds);
  if (error) {
    // Table may not exist until migration runs — treat as no trusted users.
    if (error.code === '42P01') return new Map();
    throw error;
  }
  return new Map(
    ((data ?? []) as CommunityProfileRow[]).map((row) => [
      row.user_id,
      row.is_trusted_contributor,
    ]),
  );
}

/** Ids the user has blocked. */
export async function fetchBlockedIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('community_blocks')
    .select('blocked_id')
    .eq('blocker_id', userId);
  if (error) {
    if (isSchemaNotReadyError(error)) return [];
    throw error;
  }
  return (data ?? []).map((r) => (r as { blocked_id: string }).blocked_id);
}

type PostReactionCounts = {
  likeCounts: Map<string, number>;
  dislikeCounts: Map<string, number>;
  likedByMe: Set<string>;
  dislikedByMe: Set<string>;
  commentCounts: Map<string, number>;
};

async function aggregatePostCounts(postIds: string[], userId: string): Promise<PostReactionCounts> {
  const likeCounts = new Map<string, number>();
  const dislikeCounts = new Map<string, number>();
  const likedByMe = new Set<string>();
  const dislikedByMe = new Set<string>();
  const commentCounts = new Map<string, number>();

  const { data: likes, error: likeErr } = await supabase
    .from('community_likes')
    .select('post_id, user_id')
    .in('post_id', postIds);
  if (likeErr) {
    if (isSchemaNotReadyError(likeErr)) {
      return { likeCounts, dislikeCounts, likedByMe, dislikedByMe, commentCounts };
    }
    throw likeErr;
  }

  for (const row of (likes ?? []) as { post_id: string; user_id: string }[]) {
    likeCounts.set(row.post_id, (likeCounts.get(row.post_id) ?? 0) + 1);
    if (row.user_id === userId) likedByMe.add(row.post_id);
  }

  const { data: dislikes, error: dislikeErr } = await supabase
    .from('community_dislikes')
    .select('post_id, user_id')
    .in('post_id', postIds);
  if (!dislikeErr || isSchemaNotReadyError(dislikeErr)) {
    for (const row of (dislikes ?? []) as { post_id: string; user_id: string }[]) {
      dislikeCounts.set(row.post_id, (dislikeCounts.get(row.post_id) ?? 0) + 1);
      if (row.user_id === userId) dislikedByMe.add(row.post_id);
    }
  } else if (dislikeErr) {
    throw dislikeErr;
  }

  const { data: comments, error: commentErr } = await supabase
    .from('community_comments')
    .select('post_id')
    .in('post_id', postIds)
    .is('deleted_at', null);
  if (commentErr && !isSchemaNotReadyError(commentErr)) throw commentErr;

  for (const row of (comments ?? []) as { post_id: string }[]) {
    commentCounts.set(row.post_id, (commentCounts.get(row.post_id) ?? 0) + 1);
  }

  return { likeCounts, dislikeCounts, likedByMe, dislikedByMe, commentCounts };
}

function toFeedPost(
  post: CommunityPost,
  userId: string,
  counts: PostReactionCounts,
  profileNames: Map<string, string | null>,
): FeedPost {
  const isOwn = post.user_id === userId;
  return {
    ...post,
    is_anonymous: post.is_anonymous ?? true,
    likeCount: counts.likeCounts.get(post.id) ?? 0,
    dislikeCount: counts.dislikeCounts.get(post.id) ?? 0,
    commentCount: counts.commentCounts.get(post.id) ?? 0,
    likedByMe: counts.likedByMe.has(post.id),
    dislikedByMe: counts.dislikedByMe.has(post.id),
    isOwn,
    authorLabel: resolveAuthorLabel({
      isOwn,
      isAnonymous: post.is_anonymous ?? true,
      authorFullName: profileNames.get(post.user_id),
    }),
  };
}

/** Newest posts with reaction counts, excluding blocked authors. */
export async function fetchFeed(userId: string): Promise<FeedPost[]> {
  const blocked = new Set(await fetchBlockedIds(userId));

  const { data: postRows, error } = await supabase
    .from('community_posts')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(FEED_LIMIT);
  if (error) {
    if (isSchemaNotReadyError(error)) return [];
    throw error;
  }

  const posts = ((postRows ?? []) as CommunityPost[]).filter((p) => !blocked.has(p.user_id));
  if (posts.length === 0) return [];

  const ids = posts.map((p) => p.id);
  const counts = await aggregatePostCounts(ids, userId);
  const publicAuthorIds = posts
    .filter((p) => !(p.is_anonymous ?? true))
    .map((p) => p.user_id);
  const profileNames = await fetchProfileNames(Array.from(new Set(publicAuthorIds)));

  return posts.map((p) => toFeedPost(p, userId, counts, profileNames));
}

/** A single post plus its non-deleted, non-blocked comments. */
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
  const counts = await aggregatePostCounts([postId], userId);
  const profileNames = await fetchProfileNames(
    post.is_anonymous ?? true ? [] : [post.user_id],
  );

  const { data: commentRows, error: commentErr } = await supabase
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  if (commentErr) throw commentErr;

  const rawComments = ((commentRows ?? []) as CommunityComment[]).filter(
    (c) => !blocked.has(c.user_id),
  );

  const commentIds = rawComments.map((c) => c.id);
  const commentLikeCounts = new Map<string, number>();
  const commentLikedByMe = new Set<string>();

  if (commentIds.length > 0) {
    const { data: commentLikes, error: clErr } = await supabase
      .from('community_comment_likes')
      .select('comment_id, user_id')
      .in('comment_id', commentIds);
    if (!clErr) {
      for (const row of (commentLikes ?? []) as { comment_id: string; user_id: string }[]) {
        commentLikeCounts.set(
          row.comment_id,
          (commentLikeCounts.get(row.comment_id) ?? 0) + 1,
        );
        if (row.user_id === userId) commentLikedByMe.add(row.comment_id);
      }
    }
  }

  const commentAuthorIds = Array.from(new Set(rawComments.map((c) => c.user_id)));
  const [commentProfileNames, trustedMap] = await Promise.all([
    fetchProfileNames(
      Array.from(
        new Set(
          rawComments.filter((c) => !(c.is_anonymous ?? true)).map((c) => c.user_id),
        ),
      ),
    ),
    fetchTrustedStatus(commentAuthorIds),
  ]);

  const comments: PostComment[] = rawComments.map((c) => {
    const isOwn = c.user_id === userId;
    return {
      ...c,
      is_anonymous: c.is_anonymous ?? true,
      isOwn,
      authorLabel: resolveAuthorLabel({
        isOwn,
        isAnonymous: c.is_anonymous ?? true,
        authorFullName: commentProfileNames.get(c.user_id),
      }),
      likeCount: commentLikeCounts.get(c.id) ?? 0,
      likedByMe: commentLikedByMe.has(c.id),
      isTrustedContributor: trustedMap.get(c.user_id) ?? false,
    };
  });

  return {
    post: toFeedPost(post, userId, counts, profileNames),
    comments,
  };
}

export async function createPost(
  userId: string,
  input: { title: string | null; body: string; tags: string[]; is_anonymous: boolean },
): Promise<CommunityPost> {
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      user_id: userId,
      title: input.title,
      body: input.body,
      tags: input.tags,
      is_anonymous: input.is_anonymous,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as CommunityPost;
}

export async function addComment(
  userId: string,
  postId: string,
  body: string,
  isAnonymous: boolean,
): Promise<CommunityComment> {
  const { data, error } = await supabase
    .from('community_comments')
    .insert({
      user_id: userId,
      post_id: postId,
      body,
      is_anonymous: isAnonymous,
    })
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

/** Toggle a like; clears dislike if present. */
export async function toggleLike(
  userId: string,
  postId: string,
  currentlyLiked: boolean,
): Promise<void> {
  if (!userId) throw new Error('Sign in to like posts');

  if (currentlyLiked) {
    const { error } = await supabase
      .from('community_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw error;
    return;
  }

  const { error: dislikeError } = await supabase
    .from('community_dislikes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  if (dislikeError && !isSchemaNotReadyError(dislikeError)) {
    throw dislikeError;
  }

  const { error } = await supabase
    .from('community_likes')
    .insert({ post_id: postId, user_id: userId });

  if (error) {
    // Already liked — treat as success (e.g. double tap or stale UI).
    if (error.code === '23505') return;
    if (isSchemaNotReadyError(error)) {
      throw new Error(schemaNotReadyMessage('Likes'));
    }
    throw error;
  }
}

/** Toggle a dislike; clears like if present. */
export async function toggleDislike(
  userId: string,
  postId: string,
  currentlyDisliked: boolean,
): Promise<void> {
  if (!userId) throw new Error('Sign in to react to posts');

  if (currentlyDisliked) {
    const { error } = await supabase
      .from('community_dislikes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw error;
    return;
  }

  await clearLike(userId, postId);

  const { error } = await supabase
    .from('community_dislikes')
    .insert({ post_id: postId, user_id: userId });

  if (error) {
    if (error.code === '23505') return;
    if (isSchemaNotReadyError(error)) {
      throw new Error(schemaNotReadyMessage('Reactions'));
    }
    throw error;
  }
}

async function clearLike(userId: string, postId: string): Promise<void> {
  await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', userId);
}

async function clearDislike(userId: string, postId: string): Promise<void> {
  await supabase.from('community_dislikes').delete().eq('post_id', postId).eq('user_id', userId);
}

/** Toggle a comment like. */
export async function toggleCommentLike(
  userId: string,
  commentId: string,
  liked: boolean,
): Promise<void> {
  if (liked) {
    const { error } = await supabase
      .from('community_comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('community_comment_likes')
      .insert({ comment_id: commentId, user_id: userId });
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
