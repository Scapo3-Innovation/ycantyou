import type { FlowLevel } from '@/types/database';

/** Period flow options for the daily-log picker (ordered light → heavy). */
export const FLOW_LEVELS: readonly { value: FlowLevel; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

/** Flow levels that represent actual bleeding (used to mark period days on the calendar). */
export const BLEEDING_FLOW_LEVELS: readonly FlowLevel[] = ['spotting', 'light', 'medium', 'heavy'];

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
