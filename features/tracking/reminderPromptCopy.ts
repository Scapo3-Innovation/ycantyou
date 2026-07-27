import { DAILY_NUDGE_HOUR, PERIOD_REMINDER_LEAD_DAYS } from '@/features/tracking/constants';

function formatHour12(hour24: number): string {
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12} ${suffix}`;
}

const dailyTime = formatHour12(DAILY_NUDGE_HOUR);

export const REMINDER_PROMPT_COPY = {
  title: 'Stay on track with gentle reminders',
  intro:
    'Turn on notifications so ycantyou can nudge you at the right time — without putting health details on your lock screen.',
  bullets: [
    `A daily check-in around ${dailyTime} to log mood, energy, flow, and symptoms.`,
    `A heads-up about ${PERIOD_REMINDER_LEAD_DAYS} days before your next estimated period starts (based on your logged cycles).`,
    'Reminders stay optional on your phone — you can allow or change them in device Settings anytime.',
  ] as const,
  primaryCta: 'Turn on reminders',
  secondaryCta: 'Not now',
  permissionDeniedTitle: 'Notifications blocked',
  permissionDeniedBody:
    'To get period and daily log reminders, allow notifications for ycantyou in your device Settings, then tap Turn on reminders again.',
} as const;
