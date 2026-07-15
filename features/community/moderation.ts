import type { ModerationMenuTarget } from '@/features/community/components/CommunityModerationSheet';
import type { FeedPost, PostComment } from '@/features/community/types';

export function moderationTargetFromPost(post: FeedPost): ModerationMenuTarget {
  return { type: 'post', post };
}

export function moderationTargetFromComment(comment: PostComment): ModerationMenuTarget {
  return { type: 'comment', comment };
}

export function authorIdFromTarget(target: ModerationMenuTarget): string {
  return target.type === 'post' ? target.post.user_id : target.comment.user_id;
}

export function authorLabelFromTarget(target: ModerationMenuTarget): string {
  return target.type === 'post' ? target.post.authorLabel : target.comment.authorLabel;
}
