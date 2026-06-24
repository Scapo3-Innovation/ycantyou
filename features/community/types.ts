import type { CommunityComment, CommunityPost } from '@/types/database';

/** Feed view-model: a post plus derived like/comment counts and ownership. */
export type FeedPost = CommunityPost & {
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isOwn: boolean;
};

/** A comment plus whether the signed-in user owns it. */
export type PostComment = CommunityComment & { isOwn: boolean };

/** What a report/block action targets. */
export type ModerationTarget =
  | { kind: 'post'; id: string; authorId: string }
  | { kind: 'comment'; id: string; authorId: string };
