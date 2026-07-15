import { eachDayOfInterval, format, parseISO } from 'date-fns';

import type { PartnerCalendarMark, PartnerCalendarRange } from '@/types/database';

export type TripPlannerInsight = {
  id: string;
  title: string;
  body: string;
  severity: 'info' | 'warning';
};

export type TripDaySummary = {
  date: string;
  kinds: Set<PartnerCalendarMark['kind']>;
};

function marksByDate(marks: PartnerCalendarMark[]): Map<string, Set<PartnerCalendarMark['kind']>> {
  const map = new Map<string, Set<PartnerCalendarMark['kind']>>();
  for (const mark of marks) {
    const set = map.get(mark.date) ?? new Set();
    set.add(mark.kind);
    map.set(mark.date, set);
  }
  return map;
}

/** Summarise a trip date range against shared calendar marks. */
export function analyseTripRange(
  start: string,
  end: string,
  calendar: PartnerCalendarRange,
): { days: TripDaySummary[]; insights: TripPlannerInsight[] } {
  const markMap = marksByDate(calendar.marks);
  const interval = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
  const days: TripDaySummary[] = interval.map((d) => {
    const iso = format(d, 'yyyy-MM-dd');
    return { date: iso, kinds: markMap.get(iso) ?? new Set() };
  });

  const insights: TripPlannerInsight[] = [];
  const periodDays = days.filter((d) => d.kinds.has('period')).length;
  const predictedDays = days.filter((d) => d.kinds.has('predicted_period')).length;
  const fertileDays = days.filter((d) => d.kinds.has('fertile')).length;

  if (periodDays > 0) {
    insights.push({
      id: 'period-overlap',
      title: 'Period during trip',
      body: `${periodDays} day(s) overlap logged period days. Pack supplies and keep activities flexible.`,
      severity: 'info',
    });
  }

  if (predictedDays > 0) {
    const uncertain = calendar.prediction_status === 'irregular';
    insights.push({
      id: 'predicted-overlap',
      title: uncertain ? 'Period may overlap (uncertain)' : 'Period may overlap',
      body: uncertain
        ? 'Her cycles vary — this estimate may shift. Confirm plans together closer to the date.'
        : `${predictedDays} day(s) fall in the estimated next-period window.`,
      severity: uncertain ? 'warning' : 'info',
    });
  }

  if (fertileDays > 0) {
    insights.push({
      id: 'fertile-overlap',
      title: 'Fertile window overlap',
      body: `${fertileDays} day(s) overlap an estimated fertile window. This is NOT contraception — talk openly about plans.`,
      severity: 'warning',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'clear-window',
      title: 'No major cycle overlaps flagged',
      body: 'Based on what she shares, this range looks clear of period or fertile markers. Plans can stay flexible either way.',
      severity: 'info',
    });
  }

  if (calendar.prediction_status === 'insufficient') {
    insights.push({
      id: 'insufficient-data',
      title: 'Limited cycle data',
      body: 'Not enough logged periods for reliable estimates. Use this as a conversation starter, not a schedule.',
      severity: 'warning',
    });
  }

  return { days, insights };
}
