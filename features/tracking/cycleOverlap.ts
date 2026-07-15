import { addDays, eachDayOfInterval, format, parseISO } from 'date-fns';

import { ONGOING_PERIOD_CAP_DAYS } from '@/features/tracking/constants';
import type { Cycle } from '@/types/database';

/** Effective last day of a logged period (uses cap when end is unset). */
export function cycleEndDate(cycle: Cycle): string {
  if (cycle.end_date) return cycle.end_date;
  return format(addDays(parseISO(cycle.start_date), ONGOING_PERIOD_CAP_DAYS), 'yyyy-MM-dd');
}

function rangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA <= endB && startB <= endA;
}

function effectiveEndForNewPeriod(start: string, end: string | null): string {
  if (end) return end;
  return format(addDays(parseISO(start), ONGOING_PERIOD_CAP_DAYS), 'yyyy-MM-dd');
}

/** True when the date falls inside any logged period (optionally ignoring one cycle while editing). */
export function isDateInExistingCycle(
  cycles: Cycle[],
  date: string,
  excludeCycleId?: string,
): boolean {
  return cycles.some((cycle) => {
    if (excludeCycleId && cycle.id === excludeCycleId) return false;
    return date >= cycle.start_date && date <= cycleEndDate(cycle);
  });
}

/** Find a logged period that overlaps the proposed range. */
export function findOverlappingCycle(
  cycles: Cycle[],
  start: string,
  end: string | null,
  excludeCycleId?: string,
): Cycle | undefined {
  const proposedEnd = effectiveEndForNewPeriod(start, end);
  return cycles.find((cycle) => {
    if (excludeCycleId && cycle.id === excludeCycleId) return false;
    return rangesOverlap(start, proposedEnd, cycle.start_date, cycleEndDate(cycle));
  });
}

/** All calendar dates already covered by other logged periods. */
export function blockedPeriodDates(cycles: Cycle[], excludeCycleId?: string): Set<string> {
  const blocked = new Set<string>();
  for (const cycle of cycles) {
    if (excludeCycleId && cycle.id === excludeCycleId) continue;
    const end = cycleEndDate(cycle);
    for (const day of eachDayOfInterval({ start: parseISO(cycle.start_date), end: parseISO(end) })) {
      blocked.add(format(day, 'yyyy-MM-dd'));
    }
  }
  return blocked;
}

/** Pick the period to edit — current bleed window first, otherwise the most recent log. */
export function findCycleToEdit(cycles: Cycle[], date: string): Cycle | undefined {
  for (const cycle of cycles) {
    if (date >= cycle.start_date && date <= cycleEndDate(cycle)) return cycle;
  }
  return cycles[0];
}

export const PERIOD_OVERLAP_MESSAGE =
  'This date is already part of a logged period. Edit that period instead.';

export function overlapMessageForCycle(cycle: Cycle): string {
  const endLabel = cycle.end_date
    ? format(parseISO(cycle.end_date), 'd MMM yyyy')
    : 'ongoing';
  return `Overlaps a period logged ${format(parseISO(cycle.start_date), 'd MMM')} – ${endLabel}. Edit that entry instead.`;
}
