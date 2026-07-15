import { eachDayOfInterval, endOfMonth, format, getDay, parseISO, startOfMonth } from 'date-fns';

import type { DayCategories } from '@/features/tracking/dayCategories';
import type { CyclePrediction } from '@/features/tracking/prediction';

export type DayVisualKind = 'period' | 'fertile' | 'predicted' | 'ovulation' | 'default';

export type DayVisual = {
  kind: DayVisualKind;
  isSelected: boolean;
  isToday: boolean;
};

const iso = (date: Date) => format(date, 'yyyy-MM-dd');

/** Build a 7-column month grid with leading blanks (Sunday = first column). */
export function buildMonthCells(monthStart: Date): (Date | null)[] {
  const start = startOfMonth(monthStart);
  const end = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start, end });
  const leadingBlanks = getDay(start);
  return [...Array<Date | null>(leadingBlanks).fill(null), ...days];
}

/** Resolve how a day should render in the cycle calendar. */
export function getDayVisual(
  date: string,
  categories: DayCategories,
  prediction: CyclePrediction,
  selectedDate: string,
  today: string,
): DayVisual {
  const isSelected = date === selectedDate;
  const isToday = date === today;

  if (categories.period.has(date)) {
    return { kind: 'period', isSelected, isToday };
  }

  const ovulationDay =
    prediction.status === 'regular' ? prediction.fertile?.ovulation : undefined;
  if (ovulationDay === date) {
    return { kind: 'ovulation', isSelected, isToday };
  }

  if (categories.fertile.has(date)) {
    return { kind: 'fertile', isSelected, isToday };
  }

  if (categories.predicted.has(date)) {
    return { kind: 'predicted', isSelected, isToday };
  }

  return { kind: 'default', isSelected, isToday };
}

export function monthStartFromIso(dateString: string): Date {
  return startOfMonth(parseISO(dateString));
}

export function monthIso(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

export { iso };
