import { differenceInCalendarDays, parseISO } from 'date-fns';

import type { CyclePrediction } from '@/features/tracking/prediction';
import type { Cycle } from '@/types/database';

import { deriveCyclePhase } from './phase';
import type { CyclePhase } from './types';

/** Max days after a period start we still call "in your period" when no end is logged. */
const BLEED_CAP = 8;

/** The headline cycle state shown in the dashboard hero (display only — no backend). */
export type CycleState =
  | { kind: 'none' }
  | { kind: 'period'; day: number } // Period · Day X
  | { kind: 'cycle'; day: number; phase: CyclePhase | null } // Cycle day N
  | { kind: 'late'; days: number }; // Late · N days

type Args = { cycles: Cycle[]; prediction: CyclePrediction; today: string };

/**
 * Derive the headline state from logged cycles + the (honest) prediction:
 *  - inside the most recent period → "Period · Day X",
 *  - past a regular-cycle prediction → "Late · N days",
 *  - otherwise → "Cycle day N" (with a soft phase label),
 *  - nothing logged → "none".
 */
export function deriveCycleState({ cycles, prediction, today }: Args): CycleState {
  const latest = cycles[0]; // newest-first
  if (!latest) return { kind: 'none' };

  const dayIndex = differenceInCalendarDays(parseISO(today), parseISO(latest.start_date));
  if (dayIndex < 0) return { kind: 'none' };

  const inPeriod = latest.end_date
    ? differenceInCalendarDays(parseISO(today), parseISO(latest.end_date)) <= 0
    : dayIndex <= BLEED_CAP;
  if (inPeriod) return { kind: 'period', day: dayIndex + 1 };

  if (prediction.status === 'regular') {
    const lateDays = differenceInCalendarDays(parseISO(today), parseISO(prediction.predictedStart));
    if (lateDays > 0) return { kind: 'late', days: lateDays };
  }

  const avg =
    prediction.status === 'regular' || prediction.status === 'irregular'
      ? prediction.avgLength
      : null;
  const phase = avg ? deriveCyclePhase(dayIndex, avg) : null;
  return { kind: 'cycle', day: dayIndex + 1, phase };
}
