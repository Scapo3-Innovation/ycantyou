import { format, subDays } from 'date-fns';

import type { DailyLog } from '@/types/database';

export type DayWellnessDot = {
  date: string;
  label: string;
  score: number | null;
  mood: number | null;
  hasLog: boolean;
};

/** Last 7 calendar days — for the analytics week strip. */
export function computeLast7DayDots(logs: LogForWellness[]): DayWellnessDot[] {
  const points: DayWellnessDot[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const day = subDays(new Date(), i);
    const date = format(day, 'yyyy-MM-dd');
    const log = logs.find((entry) => entry.log_date === date);
    points.push({
      date,
      label: format(day, 'EEE'),
      score: log ? dayScore(log) : null,
      mood: log?.mood ?? null,
      hasLog: Boolean(log),
    });
  }
  return points;
}

/** Average wellness score for the current week (0–100), or null if no logs. */
export function computeThisWeekScore(logs: LogForWellness[]): number | null {
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(subDays(new Date(), 6), 'yyyy-MM-dd');
  const weekLogs = logs.filter((entry) => entry.log_date >= weekStart && entry.log_date <= today);
  const avg = averageScore(weekLogs);
  return avg == null ? null : Math.round(avg);
}

export type WeekPoint = {
  label: string;
  score: number;
};

type LogForWellness = Pick<DailyLog, 'log_date' | 'mood' | 'energy'> & {
  symptom_codes?: string[];
};

/** Normalise a log to 0–100 for charting (mood/energy preferred; symptom count as fallback). */
function dayScore(log: LogForWellness): number | null {
  const parts: number[] = [];
  if (log.mood != null) parts.push(log.mood);
  if (log.energy != null) parts.push(log.energy);
  if (parts.length > 0) {
    return (parts.reduce((a, b) => a + b, 0) / parts.length / 5) * 100;
  }
  const symptomCount = log.symptom_codes?.length ?? 0;
  if (symptomCount > 0) {
    return Math.max(15, 100 - symptomCount * 18);
  }
  return null;
}

function averageScore(logs: LogForWellness[]): number | null {
  const scores = logs.map(dayScore).filter((s): s is number => s != null);
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/** Four weekly buckets ending today — used for the mini chart. */
export function computeWeeklyWellness(logs: LogForWellness[]): WeekPoint[] {
  const points: WeekPoint[] = [];
  for (let w = 3; w >= 0; w -= 1) {
    const end = subDays(new Date(), w * 7);
    const start = subDays(end, 6);
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');
    const weekLogs = logs.filter((l) => l.log_date >= startStr && l.log_date <= endStr);
    const avg = averageScore(weekLogs) ?? 0;
    points.push({ label: format(start, 'd MMM'), score: Math.round(avg) });
  }
  return points;
}

export type WellnessComparison = {
  deltaPercent: number | null;
  headline: string;
  subline: string;
};

/** Week-over-week change from recent daily logs. */
export function compareWellnessWeeks(logs: LogForWellness[]): WellnessComparison {
  const today = format(new Date(), 'yyyy-MM-dd');
  const thisStart = format(subDays(new Date(), 6), 'yyyy-MM-dd');
  const lastStart = format(subDays(new Date(), 13), 'yyyy-MM-dd');
  const lastEnd = format(subDays(new Date(), 7), 'yyyy-MM-dd');

  const thisWeek = logs.filter((l) => l.log_date >= thisStart && l.log_date <= today);
  const lastWeek = logs.filter((l) => l.log_date >= lastStart && l.log_date <= lastEnd);

  const thisAvg = averageScore(thisWeek);
  const lastAvg = averageScore(lastWeek);

  if (thisAvg == null && lastAvg == null) {
    return {
      deltaPercent: null,
      headline: 'Start logging to unlock insights',
      subline: 'Mood, energy, or symptoms — even one check-in helps.',
    };
  }

  if (thisAvg == null) {
    return {
      deltaPercent: null,
      headline: 'Log this week to compare',
      subline: 'You logged last week — add a few check-ins to see your trend.',
    };
  }

  if (lastAvg == null || lastAvg === 0) {
    return {
      deltaPercent: null,
      headline: 'Your first week of data',
      subline: 'Keep logging — we will compare weeks once you have more history.',
    };
  }

  const deltaPercent = Math.round(((thisAvg - lastAvg) / lastAvg) * 100);

  if (deltaPercent > 0) {
    return {
      deltaPercent,
      headline: 'Your symptoms are',
      subline: 'than last week',
    };
  }

  if (deltaPercent < 0) {
    return {
      deltaPercent,
      headline: 'Your check-ins are',
      subline: 'than last week — be gentle with yourself.',
    };
  }

  return {
    deltaPercent: 0,
    headline: 'Holding steady',
    subline: 'Similar to last week — consistency matters.',
  };
}
