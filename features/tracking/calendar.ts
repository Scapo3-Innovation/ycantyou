import { eachDayOfInterval, format, parseISO } from 'date-fns';
import type { TextStyle, ViewStyle } from 'react-native';

import type { Cycle, DailyLog } from '@/types/database';

import { BLEEDING_FLOW_LEVELS } from './constants';
import type { CyclePrediction } from './prediction';

/** A single day's marking for react-native-calendars (markingType="custom"). */
export type DayMarking = {
  customStyles?: { container?: ViewStyle; text?: TextStyle };
  marked?: boolean;
  dotColor?: string;
};
export type MarkedDates = Record<string, DayMarking>;

/** Colors the calendar marking needs, resolved by the screen from the active theme. */
export type CalendarPalette = {
  periodBg: string;
  periodText: string;
  fertileBg: string;
  fertileText: string;
  predictedBorder: string;
  predictedText: string;
  loggedDot: string;
  todayRing: string;
  selectedRing: string;
  text: string;
};

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

/** Inclusive list of YYYY-MM-DD dates between two ISO dates (guards against bad ranges). */
function daysInRange(start: string, end: string): string[] {
  const from = parseISO(start);
  const to = parseISO(end);
  if (to < from) return [start];
  return eachDayOfInterval({ start: from, end: to }).map(iso);
}

type BuildArgs = {
  cycles: Cycle[];
  dailyLogs: DailyLog[];
  prediction: CyclePrediction;
  selectedDate: string;
  today: string;
  palette: CalendarPalette;
};

/**
 * Build the `markedDates` map: logged period days (filled), the estimated next-period
 * window and fertile window (when regular) as distinct styles, a dot on other logged days,
 * plus today and the selected day. Estimate styles are visually softer than logged data.
 */
export function buildMarkedDates({
  cycles,
  dailyLogs,
  prediction,
  selectedDate,
  today,
  palette,
}: BuildArgs): MarkedDates {
  const periodDays = new Set<string>();
  const fertileDays = new Set<string>();
  const predictedDays = new Set<string>();
  const loggedDays = new Set<string>();

  // Logged period days from cycles (start → end, or just the start if ongoing).
  for (const cycle of cycles) {
    const end = cycle.end_date ?? cycle.start_date;
    for (const day of daysInRange(cycle.start_date, end)) periodDays.add(day);
  }

  // Daily logs: bleeding days reinforce period marking; any log gets a dot.
  for (const log of dailyLogs) {
    loggedDays.add(log.log_date);
    if (log.flow_level && BLEEDING_FLOW_LEVELS.includes(log.flow_level)) {
      periodDays.add(log.log_date);
    }
  }

  // Estimates (clearly softer styling; never overrides real logged data below).
  if (prediction.status === 'regular') {
    for (const day of daysInRange(prediction.windowStart, prediction.windowEnd)) {
      predictedDays.add(day);
    }
    if (prediction.fertile) {
      for (const day of daysInRange(prediction.fertile.start, prediction.fertile.end)) {
        fertileDays.add(day);
      }
    }
  }

  const allDays = new Set<string>([
    ...periodDays,
    ...fertileDays,
    ...predictedDays,
    ...loggedDays,
    selectedDate,
    today,
  ]);

  const marked: MarkedDates = {};
  for (const day of allDays) {
    const container: ViewStyle = {
      borderRadius: 16,
      borderWidth: 0,
    };
    let text: TextStyle = { color: palette.text };
    let dot: { marked?: boolean; dotColor?: string } = {};

    // Category background — logged period wins over estimates so real data reads clearly.
    if (periodDays.has(day)) {
      container.backgroundColor = palette.periodBg;
      text = { color: palette.periodText, fontWeight: '600' };
    } else if (fertileDays.has(day)) {
      container.backgroundColor = palette.fertileBg;
      text = { color: palette.fertileText };
    } else if (predictedDays.has(day)) {
      container.borderWidth = 1;
      container.borderStyle = 'dashed';
      container.borderColor = palette.predictedBorder;
      text = { color: palette.predictedText, fontWeight: '600' };
    } else if (loggedDays.has(day)) {
      dot = { marked: true, dotColor: palette.loggedDot };
    }

    // Today gets a subtle ring; the selected day a strong one (selected wins).
    if (day === today && day !== selectedDate) {
      container.borderWidth = Math.max(container.borderWidth ?? 0, 1);
      container.borderStyle = 'solid';
      container.borderColor = palette.todayRing;
    }
    if (day === selectedDate) {
      container.borderWidth = 2;
      container.borderStyle = 'solid';
      container.borderColor = palette.selectedRing;
    }

    marked[day] = { customStyles: { container, text }, ...dot };
  }

  return marked;
}
