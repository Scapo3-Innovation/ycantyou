import { differenceInDays, parseISO } from 'date-fns';

type PeriodEngagement = {
  eyebrow: string;
  message: string;
  stat?: string;
};

const RANGE_FACTS: PeriodEngagement[] = [
  {
    eyebrow: 'Why logging helps',
    message:
      'Two or more logged periods let us estimate your cycle length — always shown as a range, never a guarantee.',
  },
  {
    eyebrow: 'PCOS note',
    message:
      'Irregular cycles are common with PCOS. Your logs still matter — they show your personal pattern over time.',
  },
  {
    eyebrow: 'Small habit',
    message:
      'A quick daily log for mood or symptoms alongside your period builds a clearer picture for you and your clinician.',
  },
  {
    eyebrow: 'Privacy first',
    message: 'Your period data stays on your account only — export or delete it anytime from Settings.',
  },
];

const ONGOING_TIP: PeriodEngagement = {
  eyebrow: 'Still bleeding?',
  message:
    'You can save with just a start date and add the end later. Tap the last bleeding day when your period finishes.',
  stat: 'End date optional',
};

function durationLabel(start: string, end: string): string {
  const days = differenceInDays(parseISO(end), parseISO(start)) + 1;
  return `${days} day${days === 1 ? '' : 's'}`;
}

function durationMessage(days: number): string {
  if (days <= 2) {
    return 'Short periods happen. If this feels unusual for you, note it for your next clinic visit.';
  }
  if (days <= 7) {
    return 'Most periods last about 3–7 days. Logging the full range helps predictions get smarter over time.';
  }
  return 'Periods longer than a week are worth mentioning to a clinician — this log is a helpful reference.';
}

/** Pick copy for the engagement card after the user selects period dates. */
export function getPeriodEngagement(start: string, end: string | null): PeriodEngagement {
  if (!end) {
    return ONGOING_TIP;
  }

  const days = differenceInDays(parseISO(end), parseISO(start)) + 1;
  const bonus = RANGE_FACTS[days % RANGE_FACTS.length]!;

  return {
    eyebrow: bonus.eyebrow,
    message: durationMessage(days),
    stat: durationLabel(start, end),
  };
}
