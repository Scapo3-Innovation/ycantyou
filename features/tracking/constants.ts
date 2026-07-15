import type { Ionicons } from '@expo/vector-icons';

import type { FlowLevel } from '@/types/database';

import { colors } from '@/theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

export type WellnessOption = {
  value: number;
  label: string;
  icon: IconName;
  ring: string;
  iconColor: string;
};

export type FlowOption = {
  value: FlowLevel;
  label: string;
  icon: IconName;
  ring: string;
  iconColor: string;
};

/** Mood picker — calm, relatable icons on a 1–5 scale. */
export const MOOD_OPTIONS: readonly WellnessOption[] = [
  {
    value: 4,
    label: 'Good',
    icon: 'happy-outline',
    ring: colors.secondary,
    iconColor: colors.secondary,
  },
  {
    value: 3,
    label: 'Okay',
    icon: 'remove-outline',
    ring: colors.textMuted,
    iconColor: colors.textMuted,
  },
  {
    value: 2,
    label: 'Not great',
    icon: 'sad-outline',
    ring: colors.primary,
    iconColor: colors.primary,
  },
  {
    value: 1,
    label: 'Stressed',
    icon: 'cloudy-night-outline',
    ring: colors.primary,
    iconColor: colors.primary,
  },
  {
    value: 5,
    label: 'Amazing',
    icon: 'heart',
    ring: colors.primary,
    iconColor: colors.primary,
  },
];

/** Energy picker — rest and vitality without playful emoji. */
export const ENERGY_OPTIONS: readonly WellnessOption[] = [
  {
    value: 1,
    label: 'Drained',
    icon: 'battery-dead-outline',
    ring: colors.primary,
    iconColor: colors.primary,
  },
  {
    value: 2,
    label: 'Low',
    icon: 'moon-outline',
    ring: colors.primary,
    iconColor: colors.primary,
  },
  {
    value: 3,
    label: 'Steady',
    icon: 'leaf-outline',
    ring: colors.secondary,
    iconColor: colors.secondary,
  },
  {
    value: 4,
    label: 'Good',
    icon: 'sunny-outline',
    ring: colors.secondary,
    iconColor: colors.secondary,
  },
  {
    value: 5,
    label: 'Energised',
    icon: 'flash-outline',
    ring: colors.secondary,
    iconColor: colors.secondary,
  },
];

/** Period flow — droplet-style icons women recognise from cycle apps. */
export const FLOW_LEVELS: readonly FlowOption[] = [
  {
    value: 'none',
    label: 'None',
    icon: 'checkmark-circle-outline',
    ring: colors.textMuted,
    iconColor: colors.textMuted,
  },
  {
    value: 'spotting',
    label: 'Spotting',
    icon: 'ellipse-outline',
    ring: colors.primary,
    iconColor: colors.primary,
  },
  {
    value: 'light',
    label: 'Light',
    icon: 'water-outline',
    ring: colors.primary,
    iconColor: colors.primary,
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: 'water',
    ring: colors.primary,
    iconColor: colors.primary,
  },
  {
    value: 'heavy',
    label: 'Heavy',
    icon: 'water-sharp',
    ring: colors.primary,
    iconColor: colors.primary,
  },
];

/** Flow levels that represent actual bleeding (used to mark period days on the calendar). */
export const BLEEDING_FLOW_LEVELS: readonly FlowLevel[] = ['spotting', 'light', 'medium', 'heavy'];

/** Max days after a period start we treat as bleeding when no end date is logged. */
export const ONGOING_PERIOD_CAP_DAYS = 8;

/** 1–5 scale labels shared by the mood and energy pickers. */
export const SCALE_LABELS: Record<number, string> = {
  1: 'Very low',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

// --- Prediction tuning -------------------------------------------------------

/** How many recent cycles to average when estimating the next period. */
export const PREDICTION_WINDOW = 6;

/**
 * If the spread (max − min) of recent cycle lengths exceeds this many days, we treat
 * the cycles as irregular and refuse to show a confident date. 9 days mirrors the
 * screener's "cycle length varies by 8+ days" definition of irregularity.
 */
export const IRREGULAR_SPREAD_DAYS = 9;

/** Half-width (in days) of the estimated next-period window shown on the calendar. */
export const PERIOD_WINDOW_RADIUS = 2;

/** Typical fertile window for a regular cycle: ~5 days before to 1 day after ovulation. */
export const FERTILE_WINDOW_BEFORE_DAYS = 5;
export const FERTILE_WINDOW_AFTER_DAYS = 1;

/** Luteal-phase length used to place ovulation (next period start − this many days). */
export const LUTEAL_PHASE_DAYS = 14;

// --- Reminders ---------------------------------------------------------------

/** Default local-notification time for the daily-log nudge (24h). */
export const DAILY_NUDGE_HOUR = 20;
export const DAILY_NUDGE_MINUTE = 0;

/** How many days before the estimated period start to fire the period reminder. */
export const PERIOD_REMINDER_LEAD_DAYS = 2;
