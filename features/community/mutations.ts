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
  toggleCommentLike,
  toggleDislike,
  toggleLike,
} from './api';
import { communityKeys } from './queries';
import type { FeedPost, PostComment } from './types';

type PostDetail = { post: FeedPost; comments: PostComment[] } | null;

function applyPostReaction(
  p: FeedPost,
  postId: string,
  patch: Partial<Pick<FeedPost, 'likedByMe' | 'dislikedByMe' | 'likeCount' | 'dislikeCount'>>,
): FeedPost {
  return p.id === postId ? { ...p, ...patch } : p;
}

/** Create a post; invalidate the feed so it appears. */
export function useCreatePost() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  return useMutation({
    mutationFn: (input: {
      title: string | null;
      body: string;
      tags: string[];
      is_anonymous: boolean;
    }) => createPost(userId as string, input),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: communityKeys.feed(userId) });
      analytics.track('community_post_created', { anonymous: variables.is_anonymous });
    },
  });
}

/** Add a comment; refresh the post detail + feed (comment count). */
export function useAddComment(postId: string) {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  return useMutation({
    mutationFn: ({ body, is_anonymous }: { body: string; is_anonymous: boolean }) =>
      addComment(userId as string, postId, body, is_anonymous),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: communityKeys.post(postId, userId) });
      void qc.invalidateQueries({ queryKey: communityKeys.feed(userId) });
      analytics.track('community_comment_added', { anonymous: variables.is_anonymous });
    },
  });
}

/** Toggle a like with optimistic updates. */
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
      const base = prevPost?.post ?? prevFeed?.find((p) => p.id === postId);

      const patch = liked
        ? { likedByMe: false, likeCount: Math.max(0, (base?.likeCount ?? 1) - 1) }
        : {
            likedByMe: true,
            likeCount: (base?.likeCount ?? 0) + 1,
            dislikedByMe: false,
            dislikeCount: Math.max(
              0,
              (base?.dislikeCount ?? 0) - (base?.dislikedByMe ? 1 : 0),
            ),
          };

      const apply = (p: FeedPost) => applyPostReaction(p, postId, patch);

      if (prevFeed) qc.setQueryData<FeedPost[]>(feedKey, prevFeed.map(apply));
      qc.setQueryData<PostDetail>(postKey, (old) =>
        old ? { ...old, post: apply(old.post) } : old,
      );

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

/** Toggle a dislike with optimistic updates. */
export function useToggleDislike() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const feedKey = communityKeys.feed(userId);

  return useMutation({
    mutationFn: ({ postId, disliked }: { postId: string; disliked: boolean }) =>
      toggleDislike(userId as string, postId, disliked),
    onMutate: async ({ postId, disliked }) => {
      const postKey = communityKeys.post(postId, userId);
      await qc.cancelQueries({ queryKey: feedKey });
      await qc.cancelQueries({ queryKey: postKey });
      const prevFeed = qc.getQueryData<FeedPost[]>(feedKey);
      const prevPost = qc.getQueryData<PostDetail>(postKey);
      const base = prevPost?.post ?? prevFeed?.find((p) => p.id === postId);

      const patch = disliked
        ? { dislikedByMe: false, dislikeCount: Math.max(0, (base?.dislikeCount ?? 1) - 1) }
        : {
            dislikedByMe: true,
            dislikeCount: (base?.dislikeCount ?? 0) + 1,
            likedByMe: false,
            likeCount: Math.max(0, (base?.likeCount ?? 0) - (base?.likedByMe ? 1 : 0)),
          };

      const apply = (p: FeedPost) => applyPostReaction(p, postId, patch);

      if (prevFeed) qc.setQueryData<FeedPost[]>(feedKey, prevFeed.map(apply));
      qc.setQueryData<PostDetail>(postKey, (old) =>
        old ? { ...old, post: apply(old.post) } : old,
      );

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

/** Toggle a comment like with optimistic updates. */
export function useToggleCommentLike(postId: string) {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const postKey = communityKeys.post(postId, userId);

  return useMutation({
    mutationFn: ({ commentId, liked }: { commentId: string; liked: boolean }) =>
      toggleCommentLike(userId as string, commentId, liked),
    onMutate: async ({ commentId, liked }) => {
      await qc.cancelQueries({ queryKey: postKey });
      const prev = qc.getQueryData<PostDetail>(postKey);
      qc.setQueryData<PostDetail>(postKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  likedByMe: !liked,
                  likeCount: c.likeCount + (liked ? -1 : 1),
                }
              : c,
          ),
        };
      });
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(postKey, ctx.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: postKey });
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
      void qc.invalidateQueries({ queryKey: ['community', 'post'] });
    },
  });
}
