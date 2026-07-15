import type { Goal, SexAtBirth } from '@/types/database';

/** Sex assigned at birth — clinical context for cycle and PCOS insights. */
export const SEX_AT_BIRTH_OPTIONS: readonly { value: SexAtBirth; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'prefer_not_to_say', label: 'Other' },
];

/** Shown under each goal option — choosing one sets focus, not access. */
export const GOAL_FOCUS_FOOTNOTE =
  'All features stay available — this only changes what we highlight first.';

/** Onboarding path for users who pick Other / prefer not to say. */
export const ONBOARDING_PATH_OPTIONS = [
  {
    value: 'primary' as const,
    label: 'Track for myself',
    description: 'Log periods, symptoms, and health like other users.',
  },
  {
    value: 'partner' as const,
    label: 'Join as a partner',
    description: 'Enter a code from someone who invited you.',
  },
];

/** Primary goal options shown in onboarding. Values map to profiles.goal. */
export const GOALS: readonly { value: Goal; label: string; description: string }[] = [
  {
    value: 'cycle',
    label: 'Cycle regularity',
    description: 'Period tracking and spotting irregular cycles.',
  },
  {
    value: 'fertility',
    label: 'Fertility',
    description: 'Ovulation timing and fertile windows. Not contraception.',
  },
  {
    value: 'symptoms',
    label: 'Managing symptoms',
    description: 'Logging acne, pain, hair changes, and other PCOS symptoms.',
  },
  {
    value: 'weight',
    label: 'Weight',
    description: 'Gentle food and movement patterns — no crash diets.',
  },
  {
    value: 'mood',
    label: 'Mood & mental health',
    description: 'Mood, energy, and stress alongside your cycle.',
  },
];

/** DPDP consent metadata. Bump the version whenever the consent wording changes. */
export const CONSENT_TYPE_HEALTH_DATA = 'health_data';
export const CONSENT_VERSION = '2026-07-v1';

/** TODO: replace with the real hosted privacy policy before launch. */
export const PRIVACY_POLICY_URL = 'https://example.com/privacy';
