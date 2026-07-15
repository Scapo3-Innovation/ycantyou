/** In-app legal copy for ycantyou — update when policy/terms change. */

export type LegalSection = {
  title: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: readonly LegalSection[];
};

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy policy',
  lastUpdated: 'July 2026',
  intro:
    'ycantyou is a women\u2019s health app for period tracking, symptom logging, PCOS screening, and education. This policy explains what we collect, why, and how you stay in control. We follow India\u2019s Digital Personal Data Protection Act (DPDP Act).',
  sections: [
    {
      title: 'Who we are',
      paragraphs: [
        'ycantyou is operated for users in India. Health data you enter in the app is processed only to provide the features you use.',
      ],
    },
    {
      title: 'Data we collect',
      items: [
        'Account: email (if you sign in with email OTP) or an anonymous guest ID',
        'Profile: name, date of birth, sex assigned at birth, and your chosen health goal',
        'Health logs: period dates, daily flow, mood, energy, symptoms, and notes',
        'PCOS screener: your answers and risk-band results',
        'Community: posts and comments (anonymous or first-name display), likes, dislikes, and reports you file',
        'Consent records: when you agreed to health-data processing and which policy version',
        'Optional: notification preferences if you turn reminders on',
      ],
    },
    {
      title: 'How we use your data',
      items: [
        'Show your cycle calendar, predictions, home insights, and trends from your own logs',
        'Run the PCOS self-assessment and store results you can review later',
        'Personalise tips based on your chosen goal (e.g. cycle, symptoms, mood)',
        'Send optional daily or period reminders — only if you enable them',
        'Keep your account secure and sync data when you sign in on a new device',
      ],
    },
    {
      title: 'Legal basis',
      paragraphs: [
        'We process sensitive health data only after you give explicit consent during onboarding. You can withdraw consent or delete your data at any time from Settings & privacy.',
      ],
    },
    {
      title: 'Storage & security',
      items: [
        'Data is stored in Supabase (PostgreSQL) with row-level security — each user can only access her own rows',
        'Data is encrypted in transit (HTTPS) and at rest on our database host',
        'We use only the public (anon) key in the app — no service keys on your device',
        'We do not store passwords; sign-in uses email OTP or OAuth where enabled',
      ],
    },
    {
      title: 'What we never do',
      items: [
        'Sell your health data or use it for advertising',
        'Share your logs with insurers, employers, or marketers',
        'Diagnose you — the screener is a wellness tool, not a medical device',
        'Use fertility estimates as contraception advice',
      ],
    },
    {
      title: 'Your rights',
      items: [
        'Export all your data as JSON or PDF from Settings & privacy',
        'Delete your account and permanently erase your health data',
        'Withdraw consent and stop new health-data processing',
        'Correct your profile details anytime in the Profile tab',
      ],
    },
    {
      title: 'Changes',
      paragraphs: [
        'If we change this policy, we will ask for consent again when the version changes. The current version is shown in your consent record.',
      ],
    },
  ],
};

export const TERMS_OF_USE: LegalDocument = {
  title: 'Terms of use',
  lastUpdated: 'July 2026',
  intro:
    'By using ycantyou, you agree to these terms. Please read them carefully — especially the health disclaimers below.',
  sections: [
    {
      title: 'The service',
      paragraphs: [
        'ycantyou helps you track periods, log symptoms, screen for PCOS risk, read educational content, and connect with a community. Features may change as we improve the app.',
      ],
    },
    {
      title: 'Not medical advice',
      items: [
        'ycantyou is not a doctor, clinic, or diagnostic tool',
        'The PCOS screener estimates risk only — it does not diagnose PCOS or any condition',
        'Always see a qualified clinician for diagnosis, treatment, or emergencies',
        'Cycle and fertility predictions are estimates; irregular cycles reduce accuracy',
        'Fertility windows are not contraception — do not use them to prevent pregnancy',
      ],
    },
    {
      title: 'Your account',
      items: [
        'You must be at least 18 years old to use the app',
        'Keep your sign-in method secure; you are responsible for activity on your account',
        'Guest accounts can be upgraded by linking an email to keep your data',
        'Do not share health information that belongs to someone else without their consent',
      ],
    },
    {
      title: 'Community guidelines',
      items: [
        'Be respectful — no harassment, hate speech, or medical misinformation',
        'Do not share another person\u2019s private health information',
        'You can post anonymously using the incognito toggle; we still store posts under your account for safety, export, and deletion',
        'Helpful member badges recognise supportive replies — they are not medical verification',
        'We may remove content or restrict accounts that break these rules',
      ],
    },
    {
      title: 'Your data',
      paragraphs: [
        'Your use of the app is also governed by our Privacy policy. You can export or delete your data at any time from Settings & privacy.',
      ],
    },
    {
      title: 'Limitation of liability',
      paragraphs: [
        'The app is provided \u201cas is.\u201d We are not liable for decisions you make based on app content, predictions, or community posts. To the extent permitted by law, our liability is limited to the amount you paid us in the past 12 months (if any).',
      ],
    },
    {
      title: 'Changes',
      paragraphs: [
        'We may update these terms. Continued use after changes means you accept the updated terms. Material changes will be communicated in the app.',
      ],
    },
  ],
};
