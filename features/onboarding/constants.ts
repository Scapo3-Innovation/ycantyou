import type { Goal } from '@/types/database';

/** Primary goal options shown in onboarding. Values map to profiles.goal. */
export const GOALS: readonly { value: Goal; label: string }[] = [
  { value: 'cycle', label: 'Cycle regularity' },
  { value: 'fertility', label: 'Fertility' },
  { value: 'symptoms', label: 'Managing symptoms' },
  { value: 'weight', label: 'Weight' },
  { value: 'mood', label: 'Mood & mental health' },
];

/** Supported languages. English first; the rest are planned (see PROJECT_PLAN). */
export const LANGUAGES: readonly { value: string; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
];

/** DPDP consent metadata. Bump the version whenever the consent wording changes. */
export const CONSENT_TYPE_HEALTH_DATA = 'health_data';
export const CONSENT_VERSION = '2026-06-v1';

/** TODO: replace with the real hosted privacy policy before launch. */
export const PRIVACY_POLICY_URL = 'https://example.com/privacy';
