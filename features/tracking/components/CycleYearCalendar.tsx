import { format, parseISO } from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DayCategories } from '@/features/tracking/dayCategories';
import {
  buildMonthCells,
  getDayVisual,
  monthIso,
} from '@/features/tracking/calendarVisual';
import { CycleCalendarDay } from '@/features/tracking/components/CycleCalendarDay';
import type { CyclePrediction } from '@/features/tracking/prediction';
import { colors, spacing, typography } from '@/theme';

type CycleYearCalendarProps = {
  year: number;
  selectedDate: string;
  today: string;
  categories: DayCategories;
  prediction: CyclePrediction;
  onDayPress: (dateString: string) => void;
  onYearChange: (year: number) => void;
};

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/** Twelve compact month grids in a 3×4 layout — dashed rings and teal predicted text. */
export function CycleYearCalendar({
  year,
  selectedDate,
  today,
  categories,
  prediction,
  onDayPress,
  onYearChange,
}: CycleYearCalendarProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.yearNav}>
        <Pressable
          onPress={() => onYearChange(year - 1)}
          accessibilityRole="button"
          accessibilityLabel="Previous year"
          hitSlop={8}
          style={styles.navBtn}>
          <Text style={[typography.bodyMedium, { color: colors.primary }]}>‹</Text>
        </Pressable>
        <Text style={[typography.h1, styles.yearLabel, { color: colors.text }]}>{year}</Text>
        <Pressable
          onPress={() => onYearChange(year + 1)}
          accessibilityRole="button"
          accessibilityLabel="Next year"
          hitSlop={8}
          style={styles.navBtn}>
          <Text style={[typography.bodyMedium, { color: colors.primary }]}>›</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {MONTHS.map((month) => {
          const monthStart = parseISO(monthIso(year, month));
          const cells = buildMonthCells(monthStart);
          const monthLabel = format(monthStart, 'MMMM');

          return (
            <View key={month} style={styles.miniWrap}>
              <Text style={[typography.captionMedium, styles.monthLabel, { color: colors.text }]}>
                {monthLabel}
              </Text>
              <View style={styles.miniGrid}>
                {cells.map((date, index) => {
                  if (!date) {
                    return <View key={`${month}-blank-${index}`} style={styles.blankCell} />;
                  }

                  const dateString = format(date, 'yyyy-MM-dd');
                  const visual = getDayVisual(
                    dateString,
                    categories,
                    prediction,
                    selectedDate,
                    today,
                  );

                  return (
                    <CycleCalendarDay
                      key={dateString}
                      date={dateString}
                      dayNumber={date.getDate()}
                      visual={visual}
                      variant="year"
                      onPress={onDayPress}
                    />
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  yearNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  navBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearLabel: {
    minWidth: 72,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  miniWrap: {
    width: '31%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  monthLabel: {
    textAlign: 'center',
  },
  miniGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  blankCell: {
    width: `${100 / 7}%`,
    minHeight: 18,
  },
});
