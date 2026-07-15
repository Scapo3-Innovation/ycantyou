import { addMonths, format, subMonths } from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DayCategories } from '@/features/tracking/dayCategories';
import {
  buildMonthCells,
  getDayVisual,
  monthStartFromIso,
} from '@/features/tracking/calendarVisual';
import { CycleCalendarDay } from '@/features/tracking/components/CycleCalendarDay';
import type { CyclePrediction } from '@/features/tracking/prediction';
import { colors, spacing, typography } from '@/theme';

type CycleMonthCalendarProps = {
  visibleMonth: string;
  selectedDate: string;
  today: string;
  categories: DayCategories;
  prediction: CyclePrediction;
  onDayPress: (dateString: string) => void;
  onVisibleMonthChange: (dateString: string) => void;
};

/** Single-month cycle calendar — solid period fills, teal fertile text, dashed selection ring. */
export function CycleMonthCalendar({
  visibleMonth,
  selectedDate,
  today,
  categories,
  prediction,
  onDayPress,
  onVisibleMonthChange,
}: CycleMonthCalendarProps) {
  const monthStart = monthStartFromIso(visibleMonth);
  const cells = buildMonthCells(monthStart);

  function shiftMonth(delta: -1 | 1) {
    const next = delta === 1 ? addMonths(monthStart, 1) : subMonths(monthStart, 1);
    onVisibleMonthChange(format(next, 'yyyy-MM-dd'));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable
          onPress={() => shiftMonth(-1)}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          hitSlop={8}
          style={styles.navBtn}>
          <Text style={[typography.bodyMedium, { color: colors.primary }]}>‹</Text>
        </Pressable>
        <Text style={[typography.h2, styles.monthTitle, { color: colors.text }]}>
          {format(monthStart, 'MMMM')}
        </Text>
        <Pressable
          onPress={() => shiftMonth(1)}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          hitSlop={8}
          style={styles.navBtn}>
          <Text style={[typography.bodyMedium, { color: colors.primary }]}>›</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {cells.map((date, index) => {
          if (!date) {
            return <View key={`blank-${index}`} style={styles.blankCell} />;
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
              variant="month"
              onPress={onDayPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    flex: 1,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  blankCell: {
    width: `${100 / 7}%`,
    minHeight: 44,
  },
});
