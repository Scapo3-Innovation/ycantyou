import type { CyclePhase } from './types';

/** Human-readable phase names. */
export const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: 'menstrual',
  follicular: 'follicular',
  ovulation: 'ovulation',
  luteal: 'luteal',
};

/** Stable display order for phase breakdowns. */
export const PHASE_ORDER: readonly CyclePhase[] = [
  'menstrual',
  'follicular',
  'ovulation',
  'luteal',
];

// --- Insight thresholds (kept conservative so we never over-claim) -----------

/** Need at least this many measured cycle lengths before showing a trend. */
export const MIN_CYCLES_FOR_TREND = 2;

/** A symptom must be logged at least this many times (across phases) to surface. */
export const MIN_SYMPTOM_OCCURRENCES = 3;

/** ...and at least this share of its occurrences must fall in one phase to call it a lean. */
export const MIN_DOMINANT_SHARE = 0.5;

/** Show at most this many symptom-pattern insights. */
export const MAX_SYMPTOM_INSIGHTS = 3;
