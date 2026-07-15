import { eachDayOfInterval, format, parseISO, subDays } from 'date-fns';

import type { DailyLog } from '@/types/database';

export type AnalyticsPeriod = '7d' | '4w' | '3m';

export type TrendPoint = {
  key: string;
  label: string;
  dateStart: string;
  dateEnd: string;
  score: number | null;
  mood: number | null;
  energy: number | null;
  logCount: number;
};

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function dayScore(log: Pick<DailyLog, 'mood' | 'energy'>): number | null {
  const parts: number[] = [];
  if (log.mood != null) parts.push(log.mood);
  if (log.energy != null) parts.push(log.energy);
  if (parts.length === 0) return null;
  return (parts.reduce((a, b) => a + b, 0) / parts.length / 5) * 100;
}

function bucketLogs(
  logs: DailyLog[],
  dateStart: string,
  dateEnd: string,
): Pick<DailyLog, 'mood' | 'energy'>[] {
  return logs.filter((log) => log.log_date >= dateStart && log.log_date <= dateEnd);
}

function summarizeBucket(
  logs: DailyLog[],
  dateStart: string,
  dateEnd: string,
  label: string,
): TrendPoint {
  const bucket = bucketLogs(logs, dateStart, dateEnd);
  const moods = bucket.map((log) => log.mood).filter((value): value is number => value != null);
  const energies = bucket.map((log) => log.energy).filter((value): value is number => value != null);
  const scores = bucket.map(dayScore).filter((value): value is number => value != null);

  return {
    key: `${dateStart}_${dateEnd}`,
    label,
    dateStart,
    dateEnd,
    score: average(scores),
    mood: average(moods),
    energy: average(energies),
    logCount: bucket.length,
  };
}

/** Build chart buckets for the selected analytics period. */
export function computeTrendPoints(logs: DailyLog[], period: AnalyticsPeriod): TrendPoint[] {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  if (period === '7d') {
    const start = subDays(today, 6);
    return eachDayOfInterval({ start, end: today }).map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return summarizeBucket(logs, dateStr, dateStr, format(day, 'EEE'));
    });
  }

  if (period === '4w') {
    const points: TrendPoint[] = [];
    for (let week = 3; week >= 0; week -= 1) {
      const end = subDays(today, week * 7);
      const start = subDays(end, 6);
      points.push(
        summarizeBucket(
          logs,
          format(start, 'yyyy-MM-dd'),
          format(end, 'yyyy-MM-dd'),
          format(start, 'd MMM'),
        ),
      );
    }
    return points;
  }

  const points: TrendPoint[] = [];
  for (let week = 12; week >= 0; week -= 1) {
    const end = subDays(today, week * 7);
    const start = subDays(end, 6);
    const endStr = format(end, 'yyyy-MM-dd');
    if (endStr > todayStr) continue;
    points.push(
      summarizeBucket(
        logs,
        format(start, 'yyyy-MM-dd'),
        endStr,
        format(start, 'd MMM'),
      ),
    );
  }
  return points;
}

export function formatTrendRange(point: TrendPoint): string {
  if (point.dateStart === point.dateEnd) {
    return format(parseISO(point.dateStart), 'EEE, d MMM');
  }
  return `${format(parseISO(point.dateStart), 'd MMM')} – ${format(parseISO(point.dateEnd), 'd MMM')}`;
}

export function periodLabel(period: AnalyticsPeriod): string {
  switch (period) {
    case '7d':
      return 'Last 7 days';
    case '4w':
      return 'Last 4 weeks';
    case '3m':
      return 'Last 3 months';
  }
}
