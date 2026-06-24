/** In-app consent copy — bump CONSENT_VERSION in constants if this text changes. */

export type ConsentSection = {
  title: string;
  paragraphs: readonly string[];
};

export const CONSENT_SECTIONS: readonly ConsentSection[] = [
  {
    title: 'What health data we process',
    paragraphs: [
      'Information you choose to log: period dates, daily symptoms, mood, energy, flow levels, and notes.',
      'Profile details you provide: name, date of birth, sex assigned at birth, and your stated health goal.',
      'Screening answers if you use the PCOS screener — stored so you can review past results.',
    ],
  },
  {
    title: 'Why we use it',
    paragraphs: [
      'To show your cycle calendar, trends, and personalised insights based on your own logs.',
      'To run the PCOS risk screener and generate a report you can share with a clinician.',
      'To send optional reminders you turn on — never without your permission.',
    ],
  },
  {
    title: 'What we do not do',
    paragraphs: [
      'We do not sell your health data or use it for advertising.',
      'We do not share it with third parties except secure infrastructure providers that host our database (under strict contracts).',
      'We do not use your logs to diagnose you — the app is a wellness tool, not a medical device.',
    ],
  },
  {
    title: 'Your rights (DPDP Act)',
    paragraphs: [
      'Consent is voluntary and specific to the purposes above.',
      'You may withdraw consent anytime from Settings — we will stop processing new data and explain what happens to existing logs.',
      'You can export or delete all your data from Settings at any time.',
      'You may lodge a complaint with the Data Protection Board of India if you believe your rights are violated.',
    ],
  },
  {
    title: 'Security & retention',
    paragraphs: [
      'Data is encrypted in transit (HTTPS) and at rest in our database.',
      'We keep your logs while your account is active so the app can show history and trends.',
      'If you delete your account, we remove your personal health data from our systems.',
    ],
  },
];
