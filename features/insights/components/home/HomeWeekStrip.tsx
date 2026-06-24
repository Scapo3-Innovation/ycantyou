import { addDays, format, parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useRef } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import type { DayCategories } from '@/features/tracking/dayCategories';
import { colors, spacing, typography } from '@/theme';

type HomeWeekStripProps = {
  today: string;
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  categories: DayCategories;
};

type StripDay = {
  iso: string;
  dayNum: string;
  isToday: boolean;
  isSelected: boolean;
};

const DAYS_BEFORE = 30;
const DAYS_AFTER = 30;
const CELL = 52;
const CELL_SELECTED = 64;
const GAP = spacing.sm;

function buildDayRange(today: string, selectedDate: string): StripDay[] {
  const anchor = parseISO(today);
  const start = addDays(anchor, -DAYS_BEFORE);
  const total = DAYS_BEFORE + DAYS_AFTER + 1;
  return Array.from({ length: total }, (_, index) => {
    const date = addDays(start, index);
    const iso = format(date, 'yyyy-MM-dd');
    return {
      iso,
      dayNum: format(date, 'd'),
      isToday: iso === today,
      isSelected: iso === selectedDate,
    };
  });
}

function dayAccent(iso: string, categories: DayCategories) {
  if (categories.period.has(iso)) return 'period' as const;
  if (categories.fertile.has(iso)) return 'fertile' as const;
  if (categories.predicted.has(iso)) return 'predicted' as const;
  return 'default' as const;
}

function hapticTap() {
  if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function hapticSnap() {
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

/** Reference-style circular date strip with today + selected states. */
export function HomeWeekStrip({
  today,
  selectedDate,
  onSelectDate,
  categories,
}: HomeWeekStripProps) {
  const listRef = useRef<FlatList<StripDay>>(null);
  const lastSnap = useRef<number | null>(null);
  const days = useMemo(() => buildDayRange(today, selectedDate), [today, selectedDate]);
  const todayIndex = DAYS_BEFORE;
  const snap = CELL_SELECTED + GAP;

  const scrollToSelected = useCallback(
    (index: number, animated: boolean) => {
      listRef.current?.scrollToIndex({ index, animated, viewPosition: 0.5 });
    },
    [],
  );

  const onListLayout = useCallback(() => {
    const idx = days.findIndex((d) => d.iso === selectedDate);
    scrollToSelected(idx >= 0 ? idx : todayIndex, false);
  }, [days, selectedDate, scrollToSelected, todayIndex]);

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / snap);
      const clamped = Math.max(0, Math.min(index, days.length - 1));
      if (lastSnap.current !== clamped) {
        lastSnap.current = clamped;
        hapticSnap();
      }
    },
    [days.length, snap],
  );

  const renderItem: ListRenderItem<StripDay> = useCallback(
    ({ item: day }) => {
      const accent = dayAccent(day.iso, categories);
      const isPeriod = accent === 'period';
      const isPredicted = accent === 'predicted';
      const size = day.isSelected ? CELL_SELECTED : CELL;

      return (
        <Pressable
          onPress={() => {
            hapticTap();
            onSelectDate(day.iso);
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: day.isSelected }}
          accessibilityLabel={`${day.isToday ? 'Today, ' : ''}${day.dayNum}${day.isSelected ? ', selected' : ''}`}
          style={[styles.cellWrap, { width: CELL_SELECTED, marginRight: GAP }]}>
          {day.isToday && !day.isSelected ? (
            <Text style={[styles.todayTag, { color: colors.primary }]}>Today</Text>
          ) : (
            <View style={styles.todaySpacer} />
          )}
          <View
            style={[
              styles.circle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
              day.isSelected && styles.selected,
              day.isToday && !day.isSelected && styles.todayFill,
              isPeriod && !day.isSelected && styles.periodFill,
              isPredicted && !day.isSelected && !day.isToday && styles.predicted,
            ]}>
            <Text
              style={[
                typography.bodyMedium,
                styles.dayNum,
                day.isSelected && { color: colors.text, fontSize: 20 },
                (day.isToday || isPeriod) &&
                  !day.isSelected && { color: colors.primaryText },
              ]}>
              {day.dayNum}
            </Text>
          </View>
        </Pressable>
      );
    },
    [categories, onSelectDate],
  );

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={days}
        keyExtractor={(day) => day.iso}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snap}
        snapToAlignment="center"
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: snap,
          offset: snap * index,
          index,
        })}
        onLayout={onListLayout}
        onMomentumScrollEnd={onScrollEnd}
        onScrollToIndexFailed={() => {
          listRef.current?.scrollToOffset({ offset: todayIndex * snap, animated: false });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    alignItems: 'flex-end',
  },
  cellWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 88,
  },
  todayTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  todaySpacer: {
    height: 14,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  selected: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  todayFill: {
    backgroundColor: colors.primary,
  },
  periodFill: {
    backgroundColor: colors.primary,
  },
  predicted: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  dayNum: {
    fontSize: 16,
    fontWeight: '600',
  },
});
