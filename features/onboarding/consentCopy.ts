/** In-app consent copy — bump CONSENT_VERSION in constants if this text changes. */

export type ConsentBlock = {
  title: string;
  items: readonly string[];
};

export const CONSENT_INTRO =
  'ycantyou helps you track periods, log daily symptoms, screen for PCOS risk, and learn about women\u2019s health. Before we save any health information, we need your informed consent under India\u2019s DPDP Act.';

export const CONSENT_BLOCKS: readonly ConsentBlock[] = [
  {
    title: 'What we store',
    items: [
      'Period and cycle dates you log in Track',
      'Daily symptom, mood, flow, and energy entries',
      'Your profile: name, date of birth, sex assigned at birth, and health goal',
      'PCOS screener answers and past results',
      'Community posts and saved articles, if you use those features',
    ],
  },
  {
    title: 'How we use it',
    items: [
      'Show your cycle calendar, trends, and home insights from your own logs',
      'Run the PCOS screener and keep results you can review or share with a clinician',
      'Send optional daily or period reminders — only if you turn them on',
      'Keep data encrypted in transit and at rest, with row-level security so only you can access your records',
    ],
  },
  {
    title: 'What we never do',
    items: [
      'Sell your health data or use it for advertising',
      'Diagnose you — the screener is a wellness tool, not a medical device',
      'Share your logs with third parties except our secure database host (Supabase)',
    ],
  },
  {
    title: 'Your control',
    items: [
      'Withdraw consent anytime from Settings & privacy in your profile',
      'Export all your data as JSON or PDF',
      'Delete your account and permanently erase your health data',
    ],
  },
];

export const CONSENT_CHECKBOX_LABEL =
  'I consent to ycantyou processing my health data for the purposes above.';
