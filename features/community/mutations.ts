import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import { analytics } from '@/lib/analytics';

import {
  addComment,
  blockUser,
  createPost,
  reportContent,
  softDeleteComment,
  softDeletePost,
  toggleLike,
} from './api';
import { communityKeys } from './queries';
import type { FeedPost, PostComment } from './types';

type PostDetail = { post: FeedPost; comments: PostComment[] } | null;

/** Create a post; invalidate the feed so it appears. */
export function useCreatePost() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  return useMutation({
    mutationFn: (input: { title: string | null; body: string; tags: string[] }) =>
      createPost(userId as string, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityKeys.feed(userId) });
      analytics.track('post_created');
    },
  });
}

/** Add a comment; refresh the post detail + feed (comment count). */
export function useAddComment(postId: string) {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  return useMutation({
    mutationFn: (body: string) => addComment(userId as string, postId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityKeys.post(postId, userId) });
      void qc.invalidateQueries({ queryKey: communityKeys.feed(userId) });
    },
  });
}

/** Toggle a like with an optimistic ±1 on both the feed and the post detail. */
export function useToggleLike() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const feedKey = communityKeys.feed(userId);

  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      toggleLike(userId as string, postId, liked),
    onMutate: async ({ postId, liked }) => {
      const postKey = communityKeys.post(postId, userId);
      await qc.cancelQueries({ queryKey: feedKey });
      await qc.cancelQueries({ queryKey: postKey });
      const prevFeed = qc.getQueryData<FeedPost[]>(feedKey);
      const prevPost = qc.getQueryData<PostDetail>(postKey);

      const apply = (p: FeedPost): FeedPost =>
        p.id === postId
          ? { ...p, likedByMe: !liked, likeCount: p.likeCount + (liked ? -1 : 1) }
          : p;

      if (prevFeed) qc.setQueryData<FeedPost[]>(feedKey, prevFeed.map(apply));
      qc.setQueryData<PostDetail>(postKey, (old) => (old ? { ...old, post: apply(old.post) } : old));

      return { prevFeed, prevPost, postKey };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prevFeed) qc.setQueryData(feedKey, ctx.prevFeed);
      if (ctx?.prevPost && ctx.postKey) qc.setQueryData(ctx.postKey, ctx.prevPost);
    },
    onSettled: (_d, _e, { postId }) => {
      void qc.invalidateQueries({ queryKey: feedKey });
      void qc.invalidateQueries({ queryKey: communityKeys.post(postId, userId) });
    },
  });
}

/** Soft-delete own post; optimistically remove from the feed. */
export function useDeletePost() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const feedKey = communityKeys.feed(userId);
  return useMutation({
    mutationFn: (postId: string) => softDeletePost(postId),
    onMutate: async (postId) => {
      await qc.cancelQueries({ queryKey: feedKey });
      const prevFeed = qc.getQueryData<FeedPost[]>(feedKey);
      if (prevFeed) qc.setQueryData<FeedPost[]>(feedKey, prevFeed.filter((p) => p.id !== postId));
      return { prevFeed };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prevFeed) qc.setQueryData(feedKey, ctx.prevFeed);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: feedKey }),
  });
}

/** Soft-delete own comment; optimistically remove from the post detail. */
export function useDeleteComment(postId: string) {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const postKey = communityKeys.post(postId, userId);
  return useMutation({
    mutationFn: (commentId: string) => softDeleteComment(commentId),
    onMutate: async (commentId) => {
      await qc.cancelQueries({ queryKey: postKey });
      const prev = qc.getQueryData<PostDetail>(postKey);
      qc.setQueryData<PostDetail>(postKey, (old) =>
        old
          ? {
              ...old,
              post: { ...old.post, commentCount: Math.max(0, old.post.commentCount - 1) },
              comments: old.comments.filter((c) => c.id !== commentId),
            }
          : old,
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(postKey, ctx.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: postKey });
      void qc.invalidateQueries({ queryKey: communityKeys.feed(userId) });
    },
  });
}

/** File a report (post or comment) into the moderation queue. */
export function useReport() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useMutation({
    mutationFn: ({
      target,
      reason,
    }: {
      target: { postId?: string; commentId?: string };
      reason: string;
    }) => reportContent(userId as string, target, reason),
  });
}

/** Block a user; their posts and comments disappear from feeds and threads. */
export function useBlockUser() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  return useMutation({
    mutationFn: (blockedId: string) => blockUser(userId as string, blockedId),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: communityKeys.feed(userId) });
      // Refresh any open post detail (prefix-match across post ids).
      void qc.invalidateQueries({ queryKey: ['community', 'post'] });
    },
  });
}
