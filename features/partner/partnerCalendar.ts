import { format, parseISO } from 'date-fns';
import type { TextStyle, ViewStyle } from 'react-native';

import type { PartnerCalendarMark } from '@/types/database';

import { colors } from '@/theme/colors';

export type DayMarking = {
  customStyles?: { container?: ViewStyle; text?: TextStyle };
  marked?: boolean;
  dotColor?: string;
};
export type MarkedDates = Record<string, DayMarking>;

const palette = {
  periodBg: colors.roseTint,
  periodText: colors.primary,
  fertileBg: colors.tealTint,
  fertileText: colors.secondary,
  predictedBg: '#FFF5F8',
  predictedText: colors.textMuted,
};

/** Build react-native-calendars markedDates from partner RPC marks. */
export function buildPartnerMarkedDates(marks: PartnerCalendarMark[]): MarkedDates {
  const result: MarkedDates = {};
  for (const mark of marks) {
    const customStyles =
      mark.kind === 'period'
        ? { container: { backgroundColor: palette.periodBg }, text: { color: palette.periodText } }
        : mark.kind === 'fertile'
          ? { container: { backgroundColor: palette.fertileBg }, text: { color: palette.fertileText } }
          : {
              container: { backgroundColor: palette.predictedBg },
              text: { color: palette.predictedText },
            };
    result[mark.date] = { customStyles };
  }
  return result;
}

export function monthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
}

export function formatDisplayDate(iso: string): string {
  return format(parseISO(iso), 'EEE, d MMM yyyy');
}
