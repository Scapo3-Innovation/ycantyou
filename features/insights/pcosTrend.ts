import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';

import type { AnalyticsPeriod } from '@/features/insights/analyticsSeries';
import type { Cycle, DailyLog, RiskBand, ScreenerResult } from '@/types/database';

export type PcosTrendPoint = {
  key: string;
  label: string;
  dateStart: string;
  dateEnd: string;
  signLoad: number | null;
  screenerScore: number | null;
  screenerBand: RiskBand | null;
  stressDays: number;
  fatigueDays: number;
  heavyFlowDays: number;
  irregularCycles: number;
};

const MAX_SCREENER_SCORE = 22;

function bucketLogs(logs: DailyLog[], dateStart: string, dateEnd: string): DailyLog[] {
  return logs.filter((log) => log.log_date >= dateStart && log.log_date <= dateEnd);
}

function cycleLengthDays(cycle: Cycle): number | null {
  if (!cycle.end_date) return null;
  return differenceInCalendarDays(parseISO(cycle.end_date), parseISO(cycle.start_date)) + 1;
}

function isIrregularCycleLength(length: number): boolean {
  return length < 21 || length > 35;
}

function screenerInBucket(
  results: ScreenerResult[],
  dateStart: string,
  dateEnd: string,
): ScreenerResult | null {
  const matches = results.filter((result) => {
    const date = format(parseISO(result.created_at), 'yyyy-MM-dd');
    return date >= dateStart && date <= dateEnd;
  });
  return matches[0] ?? null;
}

function computeSignLoad(
  logs: DailyLog[],
  cycles: Cycle[],
  dateStart: string,
  dateEnd: string,
): Omit<PcosTrendPoint, 'key' | 'label' | 'dateStart' | 'dateEnd' | 'screenerScore' | 'screenerBand'> {
  const bucket = bucketLogs(logs, dateStart, dateEnd);
  const stressDays = bucket.filter((log) => log.mood != null && log.mood <= 2).length;
  const fatigueDays = bucket.filter((log) => log.energy != null && log.energy <= 2).length;
  const heavyFlowDays = bucket.filter(
    (log) => log.flow_level === 'heavy' || log.flow_level === 'medium',
  ).length;

  const irregularCycles = cycles.filter((cycle) => {
    const endDate = cycle.end_date ?? cycle.start_date;
    if (endDate < dateStart || endDate > dateEnd) return false;
    const length = cycleLengthDays(cycle);
    return length != null && isIrregularCycleLength(length);
  }).length;

  if (bucket.length === 0 && irregularCycles === 0) {
    return {
      signLoad: null,
      stressDays: 0,
      fatigueDays: 0,
      heavyFlowDays: 0,
      irregularCycles: 0,
    };
  }

  const rawLoad =
    stressDays * 14 +
    fatigueDays * 12 +
    heavyFlowDays * 10 +
    irregularCycles * 24;
  const signLoad = Math.min(100, Math.round(rawLoad / 4));

  return {
    signLoad,
    stressDays,
    fatigueDays,
    heavyFlowDays,
    irregularCycles,
  };
}

function buildBucket(
  logs: DailyLog[],
  cycles: Cycle[],
  screenerResults: ScreenerResult[],
  dateStart: string,
  dateEnd: string,
  label: string,
): PcosTrendPoint {
  const load = computeSignLoad(logs, cycles, dateStart, dateEnd);
  const screener = screenerInBucket(screenerResults, dateStart, dateEnd);

  return {
    key: `${dateStart}_${dateEnd}`,
    label,
    dateStart,
    dateEnd,
    ...load,
    screenerScore: screener?.score ?? null,
    screenerBand: screener?.risk_band ?? null,
  };
}

/** Weekly/daily PCOS-related sign load from logs, cycles, and screener history. */
export function computePcosTrendPoints(
  logs: DailyLog[],
  cycles: Cycle[],
  screenerResults: ScreenerResult[],
  period: AnalyticsPeriod,
): PcosTrendPoint[] {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const chronologicalScreener = [...screenerResults].sort(
    (a, b) => parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime(),
  );

  if (period === '7d') {
    const start = subDays(today, 6);
    return Array.from({ length: 7 }, (_, index) => {
      const day = subDays(today, 6 - index);
      const dateStr = format(day, 'yyyy-MM-dd');
      return buildBucket(
        logs,
        cycles,
        chronologicalScreener,
        dateStr,
        dateStr,
        format(day, 'EEE'),
      );
    });
  }

  if (period === '4w') {
    const points: PcosTrendPoint[] = [];
    for (let week = 3; week >= 0; week -= 1) {
      const end = subDays(today, week * 7);
      const start = subDays(end, 6);
      points.push(
        buildBucket(
          logs,
          cycles,
          chronologicalScreener,
          format(start, 'yyyy-MM-dd'),
          format(end, 'yyyy-MM-dd'),
          format(start, 'd MMM'),
        ),
      );
    }
    return points;
  }

  const points: PcosTrendPoint[] = [];
  for (let week = 12; week >= 0; week -= 1) {
    const end = subDays(today, week * 7);
    const start = subDays(end, 6);
    const endStr = format(end, 'yyyy-MM-dd');
    if (endStr > todayStr) continue;
    points.push(
      buildBucket(
        logs,
        cycles,
        chronologicalScreener,
        format(start, 'yyyy-MM-dd'),
        endStr,
        format(start, 'd MMM'),
      ),
    );
  }
  return points;
}

export function normalizeScreenerScore(score: number): number {
  return Math.min(100, Math.round((score / MAX_SCREENER_SCORE) * 100));
}

export function comparePcosTrend(points: PcosTrendPoint[]): {
  headline: string;
  subline: string;
  deltaPercent: number | null;
} {
  const withLoad = points.filter((point) => point.signLoad != null);
  if (withLoad.length < 2) {
    return {
      headline: 'Keep logging to track PCOS-related signs',
      subline: 'Mood, energy, flow, and screener results help show change over time.',
      deltaPercent: null,
    };
  }

  const recent = withLoad.slice(-Math.min(2, withLoad.length));
  const previous = withLoad.slice(-Math.min(4, withLoad.length), -Math.min(2, withLoad.length));
  const recentAvg =
    recent.reduce((sum, point) => sum + (point.signLoad ?? 0), 0) / recent.length;
  const previousAvg =
    previous.length > 0
      ? previous.reduce((sum, point) => sum + (point.signLoad ?? 0), 0) / previous.length
      : null;

  if (previousAvg == null || previousAvg === 0) {
    return {
      headline: 'Building your PCOS sign trend',
      subline: 'More check-ins will show whether related signs are easing or rising.',
      deltaPercent: null,
    };
  }

  const deltaPercent = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
  if (deltaPercent < -5) {
    return {
      headline: 'Related signs look lower recently',
      subline: 'From your own logs — not a diagnosis. Keep tracking and see a clinician with concerns.',
      deltaPercent,
    };
  }
  if (deltaPercent > 5) {
    return {
      headline: 'Related signs look higher recently',
      subline: 'From your own logs — not a diagnosis. Be gentle with yourself and talk to a clinician if worried.',
      deltaPercent,
    };
  }

  return {
    headline: 'Related signs are fairly steady',
    subline: 'From your own logs — not a diagnosis. Keep tracking over time.',
    deltaPercent: 0,
  };
}
