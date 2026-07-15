import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';

import { BLEEDING_FLOW_LEVELS } from '@/features/tracking/constants';
import { cycleEndDate } from '@/features/tracking/cycleOverlap';
import type { CyclePrediction } from '@/features/tracking/prediction';
import type { Cycle, DailyLog } from '@/types/database';

import { deriveCyclePhase } from './phase';
import type { CyclePhase } from './types';

/** The headline cycle state shown in the dashboard hero (display only — no backend). */
export type CycleState =
  | { kind: 'none' }
  | { kind: 'period'; day: number } // Period · Day X
  | { kind: 'cycle'; day: number; phase: CyclePhase | null } // Cycle day N
  | { kind: 'late'; days: number }; // Late · N days

type Args = {
  cycles: Cycle[];
  prediction: CyclePrediction;
  today: string;
  dailyLogs?: DailyLog[];
};

/** Find the logged period that contains a date, checking every cycle — not just the newest. */
function findCycleContainingDate(cycles: Cycle[], date: string): Cycle | null {
  for (const cycle of cycles) {
    if (date < cycle.start_date) continue;
    if (date <= cycleEndDate(cycle)) return cycle;
  }
  return null;
}

/** Most recent period that has already started on or before the date. */
function anchorCycle(cycles: Cycle[], date: string): Cycle | null {
  return cycles.find((cycle) => cycle.start_date <= date) ?? null;
}

/** Fallback when bleeding is logged on daily logs but not yet in a cycle row. */
function periodDayFromFlowLogs(date: string, dailyLogs: DailyLog[]): number | null {
  const bleedingDates = new Set(
    dailyLogs
      .filter((log) => log.flow_level && BLEEDING_FLOW_LEVELS.includes(log.flow_level))
      .map((log) => log.log_date),
  );
  if (!bleedingDates.has(date)) return null;

  let start = date;
  let cursor = parseISO(date);
  while (true) {
    const prev = format(subDays(cursor, 1), 'yyyy-MM-dd');
    if (!bleedingDates.has(prev)) break;
    start = prev;
    cursor = subDays(cursor, 1);
  }

  return differenceInCalendarDays(parseISO(date), parseISO(start)) + 1;
}

/**
 * Derive the headline state from logged cycles + the (honest) prediction:
 *  - inside any logged period → "Period · Day X",
 *  - past a regular-cycle prediction → "Late · N days",
 *  - otherwise → "Cycle day N" (with a soft phase label),
 *  - nothing logged → "none".
 */
export function deriveCycleState({
  cycles,
  prediction,
  today,
  dailyLogs = [],
}: Args): CycleState {
  const containing = findCycleContainingDate(cycles, today);
  if (containing) {
    const day = differenceInCalendarDays(parseISO(today), parseISO(containing.start_date)) + 1;
    return { kind: 'period', day };
  }

  const flowDay = periodDayFromFlowLogs(today, dailyLogs);
  if (flowDay !== null) {
    return { kind: 'period', day: flowDay };
  }

  if (cycles.length === 0) return { kind: 'none' };

  const anchor = anchorCycle(cycles, today);
  if (!anchor) return { kind: 'none' };

  const dayIndex = differenceInCalendarDays(parseISO(today), parseISO(anchor.start_date));

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

export { cycleEndDate };
