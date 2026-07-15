import { addDays, eachDayOfInterval, format, parseISO } from 'date-fns';

import type { Cycle, DailyLog } from '@/types/database';

import { BLEEDING_FLOW_LEVELS, ONGOING_PERIOD_CAP_DAYS } from './constants';
import type { CyclePrediction } from './prediction';

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

function daysInRange(start: string, end: string): string[] {
  const from = parseISO(start);
  const to = parseISO(end);
  if (to < from) return [start];
  return eachDayOfInterval({ start: from, end: to }).map(iso);
}

/** Day buckets used by the calendar and the home week strip. */
export type DayCategories = {
  period: Set<string>;
  fertile: Set<string>;
  predicted: Set<string>;
  logged: Set<string>;
};

/** Classify dates for marking — shared by the track calendar and home week strip. */
export function buildDayCategories(
  cycles: Cycle[],
  dailyLogs: DailyLog[],
  prediction: CyclePrediction,
): DayCategories {
  const period = new Set<string>();
  const fertile = new Set<string>();
  const predicted = new Set<string>();
  const logged = new Set<string>();

  for (const cycle of cycles) {
    const end =
      cycle.end_date ??
      format(addDays(parseISO(cycle.start_date), ONGOING_PERIOD_CAP_DAYS), 'yyyy-MM-dd');
    for (const day of daysInRange(cycle.start_date, end)) period.add(day);
  }

  for (const log of dailyLogs) {
    logged.add(log.log_date);
    if (log.flow_level && BLEEDING_FLOW_LEVELS.includes(log.flow_level)) {
      period.add(log.log_date);
    }
  }

  if (prediction.status === 'regular') {
    for (const day of daysInRange(prediction.windowStart, prediction.windowEnd)) {
      predicted.add(day);
    }
    if (prediction.fertile) {
      for (const day of daysInRange(prediction.fertile.start, prediction.fertile.end)) {
        fertile.add(day);
      }
    }
  }

  return { period, fertile, predicted, logged };
}

export { daysInRange };
