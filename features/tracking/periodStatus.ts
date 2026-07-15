import { differenceInCalendarDays, format, parseISO } from 'date-fns';

import type { DayCategories } from '@/features/tracking/dayCategories';
import type { CyclePrediction } from '@/features/tracking/prediction';
import { BLEEDING_FLOW_LEVELS } from '@/features/tracking/constants';
import type { Cycle, DailyLog } from '@/types/database';

export type DayStatus = {
  heading: string;
  title: string;
  isPeriod: boolean;
};

function periodDayForDate(date: string, cycles: Cycle[]): number | null {
  for (const cycle of cycles.filter((c) => !c.is_predicted)) {
    const end = cycle.end_date ?? cycle.start_date;
    if (date >= cycle.start_date && date <= end) {
      return differenceInCalendarDays(parseISO(date), parseISO(cycle.start_date)) + 1;
    }
  }
  return null;
}

function hasBleedingLog(date: string, dailyLogs: DailyLog[]): boolean {
  const log = dailyLogs.find((l) => l.log_date === date);
  return Boolean(log?.flow_level && BLEEDING_FLOW_LEVELS.includes(log.flow_level));
}

/** Human-readable status for the track screen's today card. */
export function getDayStatus(
  date: string,
  today: string,
  cycles: Cycle[],
  dailyLogs: DailyLog[],
  prediction: CyclePrediction,
  categories: DayCategories,
): DayStatus {
  const heading =
    date === today
      ? `Today, ${format(parseISO(date), 'd MMM')}`
      : format(parseISO(date), 'EEE, d MMM');

  const periodDay = periodDayForDate(date, cycles);
  if (periodDay != null) {
    return {
      heading,
      title: `Period day ${periodDay}`,
      isPeriod: true,
    };
  }

  if (hasBleedingLog(date, dailyLogs)) {
    return {
      heading,
      title: 'Bleeding logged',
      isPeriod: true,
    };
  }

  if (categories.fertile.has(date) && prediction.status === 'regular') {
    return {
      heading,
      title: 'Estimated fertile window',
      isPeriod: false,
    };
  }

  if (categories.predicted.has(date) && prediction.status === 'regular') {
    return {
      heading,
      title: 'Next period (estimate)',
      isPeriod: false,
    };
  }

  if (prediction.status === 'insufficient') {
    return {
      heading,
      title: 'Start logging your period',
      isPeriod: false,
    };
  }

  return {
    heading,
    title: 'Not on your period',
    isPeriod: false,
  };
}
