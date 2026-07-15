import type { CommunityComment, CommunityPost } from '@/types/database';

/** Feed view-model: a post plus derived counts and ownership. */
export type FeedPost = CommunityPost & {
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  likedByMe: boolean;
  dislikedByMe: boolean;
  isOwn: boolean;
  authorLabel: string;
};

/** A comment plus whether the signed-in user owns it. */
export type PostComment = CommunityComment & {
  isOwn: boolean;
  authorLabel: string;
  likeCount: number;
  likedByMe: boolean;
  isTrustedContributor: boolean;
};

/** What a report/block action targets. */
export type ModerationTarget =
  | { kind: 'post'; id: string; authorId: string }
  | { kind: 'comment'; id: string; authorId: string };
