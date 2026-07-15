import { BRAND_NAME, BRAND_TAGLINE } from '@/features/brand/assets';

import { formatCompactCount } from './formatCount';

const BODY_MAX = 480;

type SharePostInput = {
  body: string;
  likeCount: number;
  commentCount?: number;
};

/** Prefilled share text — post body, engagement, and app promo. */
export function buildPostShareMessage(post: SharePostInput): string {
  const body =
    post.body.length > BODY_MAX ? `${post.body.slice(0, BODY_MAX).trim()}…` : post.body.trim();

  const likesLine = `❤️ ${formatCompactCount(post.likeCount)} ${
    post.likeCount === 1 ? 'like' : 'likes'
  }`;

  const commentsLine =
    post.commentCount != null && post.commentCount > 0
      ? `💬 ${formatCompactCount(post.commentCount)} ${
          post.commentCount === 1 ? 'comment' : 'comments'
        }`
      : null;

  const engagement = [likesLine, commentsLine].filter(Boolean).join(' · ');

  return [
    body,
    '',
    engagement,
    '',
    '—',
    `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    "A supportive app for women's health, periods, and PCOS. Join the community!",
  ].join('\n');
}
