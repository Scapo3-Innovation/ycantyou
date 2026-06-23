import { differenceInCalendarDays, parseISO } from 'date-fns';

import type { CyclePhase } from './types';

/**
 * Days since a period start (0-based, matching the SQL `log_date - start_date`).
 * Display as `dayIndex + 1` ("cycle day 1" on the start date).
 */
export function daysSinceStart(lastStart: string, today: string): number {
  return differenceInCalendarDays(parseISO(today), parseISO(lastStart));
}

/**
 * Bucket a day-in-cycle into a phase, using the same boundaries as the SQL
 * aggregation so the status card and the insights agree. `cycleLen` is the average
 * cycle length; ovulation is placed ~14 days before the next expected period.
 */
export function deriveCyclePhase(dayIndex: number, cycleLen: number): CyclePhase {
  if (dayIndex < 5) return 'menstrual';
  if (dayIndex >= cycleLen - 15 && dayIndex <= cycleLen - 13) return 'ovulation';
  if (dayIndex > cycleLen - 13) return 'luteal';
  return 'follicular';
}
