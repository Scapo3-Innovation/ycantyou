import type { PartnerSharingSettings } from '@/types/database';

/** Default sharing when a connection is created — fertility and wellness off. */
export const DEFAULT_PARTNER_SHARING: PartnerSharingSettings = {
  cycle_phase: true,
  period_dates: true,
  predictions: true,
  fertile_window: false,
  mood_energy_summary: false,
  symptoms_summary: false,
  daily_notes: false,
  screener_summary: false,
};

export type SharingToggleDef = {
  key: keyof PartnerSharingSettings;
  label: string;
  description: string;
  category: 'cycle' | 'wellness' | 'fertility' | 'health';
  advanced?: boolean;
};

export const SHARING_TOGGLES: readonly SharingToggleDef[] = [
  {
    key: 'cycle_phase',
    label: 'Cycle phase',
    description: 'Period day or phase like follicular or luteal — no raw logs.',
    category: 'cycle',
  },
  {
    key: 'period_dates',
    label: 'Period dates',
    description: 'Logged period days on the calendar.',
    category: 'cycle',
  },
  {
    key: 'predictions',
    label: 'Next period estimate',
    description: 'Predicted period window when cycles are regular enough.',
    category: 'cycle',
  },
  {
    key: 'mood_energy_summary',
    label: "Today's mood & energy",
    description: 'Simple labels only — never notes.',
    category: 'wellness',
  },
  {
    key: 'symptoms_summary',
    label: "Today's symptoms",
    description: 'Symptom chips for today only.',
    category: 'wellness',
  },
  {
    key: 'fertile_window',
    label: 'Fertile window estimate',
    description: 'Only when cycles are regular. Not contraception.',
    category: 'fertility',
  },
  {
    key: 'screener_summary',
    label: 'PCOS screener risk band',
    description: 'Low / moderate / high label only — not her answers.',
    category: 'health',
  },
  {
    key: 'daily_notes',
    label: 'Daily notes',
    description: 'Private journal entries — strongly discouraged.',
    category: 'wellness',
    advanced: true,
  },
];
