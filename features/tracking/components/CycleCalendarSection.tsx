import { StyleSheet } from 'react-native';

import { Card } from '@/components/ui/Card';
import type { DayCategories } from '@/features/tracking/dayCategories';
import { CalendarLegend } from '@/features/tracking/components/CalendarLegend';
import { CycleMonthCalendar } from '@/features/tracking/components/CycleMonthCalendar';
import { CycleYearCalendar } from '@/features/tracking/components/CycleYearCalendar';
import type { CyclePrediction } from '@/features/tracking/prediction';
import { spacing } from '@/theme';

type CalendarViewMode = 'month' | 'year';

type CycleCalendarSectionProps = {
  view: CalendarViewMode;
  selectedDate: string;
  today: string;
  visibleMonth: string;
  onVisibleMonthChange: (dateString: string) => void;
  calendarYear: number;
  onYearChange: (year: number) => void;
  categories: DayCategories;
  prediction: CyclePrediction;
  onDayPress: (dateString: string) => void;
};

/** Cycle calendar card with reference-style day styling. */
export function CycleCalendarSection({
  view,
  selectedDate,
  today,
  visibleMonth,
  onVisibleMonthChange,
  calendarYear,
  onYearChange,
  categories,
  prediction,
  onDayPress,
}: CycleCalendarSectionProps) {
  return (
    <Card style={styles.card}>
      {view === 'month' ? (
        <CycleMonthCalendar
          visibleMonth={visibleMonth}
          selectedDate={selectedDate}
          today={today}
          categories={categories}
          prediction={prediction}
          onDayPress={onDayPress}
          onVisibleMonthChange={onVisibleMonthChange}
        />
      ) : (
        <CycleYearCalendar
          year={calendarYear}
          selectedDate={selectedDate}
          today={today}
          categories={categories}
          prediction={prediction}
          onDayPress={onDayPress}
          onYearChange={onYearChange}
        />
      )}

      <CalendarLegend view={view} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
});
