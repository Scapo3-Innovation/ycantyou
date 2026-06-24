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

export const FEED_LIMIT = 50;
export const TITLE_MAX = 120;
export const POST_MAX = 2000;
export const COMMENT_MAX = 1000;
