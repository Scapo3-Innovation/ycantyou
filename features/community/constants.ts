/** Preset report reasons (written to community_reports.reason). */
export const REPORT_REASONS = [
  'Spam or promotion',
  'Harassment or bullying',
  'Medical misinformation',
  'Other',
] as const;

/** Community guidelines shown on the feed. */
export const CONTENT_RULES =
  'Be supportive and kind. No medical advice, diagnoses, or promotion/selling. Report anything harmful.';

export const COMMUNITY_DISCLAIMER =
  'Peer support only — not medical advice. See a clinician for concerns.';

export const FEED_LIMIT = 50;
export const TITLE_MAX = 120;
export const POST_MAX = 2000;
export const COMMENT_MAX = 1000;

export const TOPIC_TAGS = ['period', 'mood', 'pcos', 'support'] as const;

export const TRUSTED_MIN_LIKES = 20;
export const TRUSTED_MIN_COMMENTS = 5;

export type FeedSort = 'latest' | 'most_liked';

/** Feed filter tabs — Popular maps to most_liked; Following is UI-only until follow ships. */
export type FeedFilter = 'popular' | 'mine' | 'following';
