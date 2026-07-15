import { Ionicons } from '@expo/vector-icons';
import { addDays, format, getDay, parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useCallback, useImperativeHandle, useMemo, useRef, forwardRef } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import type { DayCategories } from '@/features/tracking/dayCategories';
import { getDayVisual, type DayVisualKind } from '@/features/tracking/calendarVisual';
import type { CyclePrediction } from '@/features/tracking/prediction';
import { colors, spacing, typography } from '@/theme';

type HomeWeekStripProps = {
  today: string;
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  categories: DayCategories;
  prediction: CyclePrediction;
};

export type HomeWeekStripHandle = {
  scrollToToday: () => void;
};

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

type StripDay = {
  iso: string;
  dayNum: string;
  weekday: (typeof WEEKDAY_LETTERS)[number];
  isToday: boolean;
  isSelected: boolean;
};

type StripDayCellProps = {
  day: StripDay;
  index: number;
  kind: DayVisualKind;
  scrollX: SharedValue<number>;
  isScrolling: SharedValue<number>;
  slotWidth: number;
  sidePadding: number;
  screenWidth: number;
  onSelect: (iso: string, index: number) => void;
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<StripDay>);

const DAYS_BEFORE = 30;
const DAYS_AFTER = 30;
const SLOT_WIDTH = 48;
const BUBBLE_SIZE = 38;
const BUBBLE_RADIUS = BUBBLE_SIZE / 2;
const RING_SIZE = BUBBLE_SIZE + 10;
const RING_RADIUS = RING_SIZE / 2;

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
      weekday: WEEKDAY_LETTERS[getDay(date)]!,
      isToday: iso === today,
      isSelected: iso === selectedDate,
    };
  });
}

function kindLabel(kind: DayVisualKind): string {
  switch (kind) {
    case 'period':
      return ', period day';
    case 'fertile':
      return ', estimated fertile window';
    case 'predicted':
      return ', estimated next period';
    case 'ovulation':
      return ', estimated ovulation day';
    default:
      return '';
  }
}

function weekdayColor(kind: DayVisualKind, day: StripDay): string {
  if (day.isSelected) return colors.primary;
  if (day.isToday) return colors.primary;
  if (kind === 'fertile' || kind === 'ovulation') return colors.secondary;
  if (kind === 'predicted') return colors.primary;
  return colors.textFaint;
}

function hapticTap() {
  if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function hapticSnap() {
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

function StripDayCell({
  day,
  index,
  kind,
  scrollX,
  isScrolling,
  slotWidth,
  sidePadding,
  screenWidth,
  onSelect,
}: StripDayCellProps) {
  const bubbleAnimatedStyle = useAnimatedStyle(() => {
    const itemCenter = sidePadding + index * slotWidth + slotWidth / 2;
    const viewportCenter = scrollX.value + screenWidth / 2;
    const distance = Math.abs(viewportCenter - itemCenter);

    const scrollScale = interpolate(
      distance,
      [0, slotWidth, slotWidth * 2.4],
      [1.08, 1, 0.92],
      Extrapolation.CLAMP,
    );
    const scale = isScrolling.value > 0 ? scrollScale : 1;

    const saturation = interpolate(
      distance,
      [0, slotWidth, slotWidth * 2.5],
      [1, 0.75, 0.4],
      Extrapolation.CLAMP,
    );

    return { transform: [{ scale }], opacity: saturation };
  });

  const bubbleStyles: ViewStyle[] = [styles.bubble];
  let dayNumColor: string = colors.text;

  if (kind === 'period') {
    bubbleStyles.push(styles.bubblePeriod);
    dayNumColor = colors.primaryText;
  } else if (kind === 'fertile') {
    bubbleStyles.push(styles.bubbleFertile);
    dayNumColor = colors.secondary;
  } else if (kind === 'ovulation') {
    bubbleStyles.push(styles.bubbleOvulation);
    dayNumColor = colors.secondary;
  } else if (kind === 'predicted') {
    bubbleStyles.push(styles.bubblePredicted);
    dayNumColor = colors.primary;
  }

  const showFocusRing = useAnimatedStyle(() => {
    const itemCenter = sidePadding + index * slotWidth + slotWidth / 2;
    const viewportCenter = scrollX.value + screenWidth / 2;
    const distance = Math.abs(viewportCenter - itemCenter);
    return { opacity: distance < slotWidth * 0.35 ? 1 : 0 };
  });

  const showSelectedRing = day.isSelected;
  const showTodayRing = day.isToday && !day.isSelected;

  return (
    <View style={[styles.cell, { width: slotWidth }]}>
      <Pressable
        onPress={() => {
          hapticTap();
          onSelect(day.iso, index);
        }}
        accessibilityRole="button"
        accessibilityState={{ selected: day.isSelected }}
        accessibilityLabel={`${day.weekday}, ${day.isToday ? 'Today, ' : ''}${day.dayNum}${day.isSelected ? ', selected' : ''}${kindLabel(kind)}`}
        style={styles.pressable}>
        <Text
          style={[
            styles.weekday,
            { color: weekdayColor(kind, day) },
            day.isToday && !day.isSelected && { fontWeight: '700' },
          ]}>
          {day.weekday}
        </Text>

        <Animated.View style={[styles.bubbleShell, bubbleAnimatedStyle]}>
          {showSelectedRing || showTodayRing ? (
            <View
              style={[
                styles.staticRing,
                showTodayRing && styles.staticRingToday,
                showSelectedRing && styles.staticRingSelected,
                kind === 'period' && showSelectedRing && styles.staticRingOnPeriod,
              ]}
            />
          ) : null}
          <Animated.View
            style={[
              styles.focusRing,
              kind === 'period' && styles.focusRingOnFill,
              showFocusRing,
            ]}
          />
          <View style={bubbleStyles}>
            <Text style={[typography.bodyMedium, styles.dayNum, { color: dayNumColor }]}>
              {day.dayNum}
            </Text>
          </View>
        </Animated.View>

        <DayMarker kind={kind} isToday={day.isToday && kind !== 'period'} />
      </Pressable>
    </View>
  );
}

function DayMarker({ kind, isToday }: { kind: DayVisualKind; isToday: boolean }) {
  if (kind === 'ovulation') {
    return <Ionicons name="heart" size={8} color={colors.primary} style={styles.marker} />;
  }
  if (kind === 'fertile') {
    return <View style={[styles.markerDot, { backgroundColor: colors.secondary }]} />;
  }
  if (kind === 'predicted') {
    return <View style={[styles.markerDot, styles.markerPredicted]} />;
  }
  if (isToday) {
    return <View style={[styles.markerDot, { backgroundColor: colors.primary }]} />;
  }
  return <View style={styles.markerSpacer} />;
}

function StripLegend() {
  return (
    <View style={styles.legendRow}>
      <View style={styles.legendItem}>
        <View style={[styles.legendSwatch, styles.legendPeriod]} />
        <Text style={[typography.caption, styles.legendText, { color: colors.textFaint }]}>
          Period
        </Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendSwatch, styles.legendFertile]} />
        <Text style={[typography.caption, styles.legendText, { color: colors.textFaint }]}>
          Fertile (est.)
        </Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendSwatch, styles.legendPredicted]} />
        <Text style={[typography.caption, styles.legendText, { color: colors.textFaint }]}>
          Next period (est.)
        </Text>
      </View>
    </View>
  );
}

/** Lens-style date strip — weekday letters, cycle colours, scroll-only scale. */
export const HomeWeekStrip = forwardRef<HomeWeekStripHandle, HomeWeekStripProps>(
  function HomeWeekStrip({ today, selectedDate, onSelectDate, categories, prediction }, ref) {
  const { width: screenWidth } = useWindowDimensions();
  const listRef = useRef<FlatList<StripDay>>(null);
  const lastSnap = useRef<number | null>(null);
  const scrollX = useSharedValue(0);
  const isScrolling = useSharedValue(0);
  const sidePadding = (screenWidth - SLOT_WIDTH) / 2;

  const days = useMemo(() => buildDayRange(today, selectedDate), [today, selectedDate]);
  const todayIndex = DAYS_BEFORE;
  const snapOffsets = useMemo(
    () => days.map((_, index) => index * SLOT_WIDTH),
    [days],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const scrollToCenter = useCallback(
    (index: number, animated: boolean) => {
      const clamped = Math.max(0, Math.min(index, days.length - 1));
      const offset = clamped * SLOT_WIDTH;
      listRef.current?.scrollToOffset({ offset, animated });
      if (!animated) {
        scrollX.value = offset;
      }
      lastSnap.current = clamped;
    },
    [days.length, scrollX],
  );

  const onListLayout = useCallback(() => {
    const idx = days.findIndex((d) => d.iso === selectedDate);
    scrollToCenter(idx >= 0 ? idx : todayIndex, false);
  }, [days, selectedDate, scrollToCenter, todayIndex]);

  const settleSelection = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / SLOT_WIDTH);
      const clamped = Math.max(0, Math.min(index, days.length - 1));
      if (lastSnap.current !== clamped) {
        lastSnap.current = clamped;
        hapticSnap();
      }
      const iso = days[clamped]?.iso;
      if (iso && iso !== selectedDate) onSelectDate(iso);
    },
    [days, onSelectDate, selectedDate],
  );

  const onScrollBegin = useCallback(() => {
    isScrolling.value = 1;
  }, [isScrolling]);

  const onScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const velocity = event.nativeEvent.velocity?.x ?? 0;
      if (Math.abs(velocity) < 0.05) {
        isScrolling.value = 0;
        settleSelection(event);
      }
    },
    [isScrolling, settleSelection],
  );

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrolling.value = 0;
      settleSelection(event);
    },
    [isScrolling, settleSelection],
  );

  const onSelect = useCallback(
    (iso: string, index: number) => {
      onSelectDate(iso);
      scrollToCenter(index, true);
    },
    [onSelectDate, scrollToCenter],
  );

  const scrollToToday = useCallback(() => {
    onSelectDate(today);
    scrollToCenter(todayIndex, true);
  }, [onSelectDate, scrollToCenter, today, todayIndex]);

  useImperativeHandle(ref, () => ({ scrollToToday }), [scrollToToday]);

  const showLegend = prediction.status === 'regular';

  const renderItem: ListRenderItem<StripDay> = useCallback(
    ({ item, index }) => {
      const visual = getDayVisual(item.iso, categories, prediction, selectedDate, today);
      return (
        <StripDayCell
          day={item}
          index={index}
          kind={visual.kind}
          scrollX={scrollX}
          isScrolling={isScrolling}
          slotWidth={SLOT_WIDTH}
          sidePadding={sidePadding}
          screenWidth={screenWidth}
          onSelect={onSelect}
        />
      );
    },
    [categories, prediction, selectedDate, today, onSelect, scrollX, isScrolling, sidePadding, screenWidth],
  );

  return (
    <View style={styles.wrap}>
      <AnimatedFlatList
        ref={listRef}
        data={days}
        keyExtractor={(day) => day.iso}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToOffsets={snapOffsets}
        snapToAlignment="start"
        disableIntervalMomentum
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: sidePadding }]}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: SLOT_WIDTH,
          offset: SLOT_WIDTH * index,
          index,
        })}
        onLayout={onListLayout}
        onScrollBeginDrag={onScrollBegin}
        onMomentumScrollBegin={onScrollBegin}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
        onScrollToIndexFailed={() => {
          scrollToCenter(todayIndex, false);
        }}
      />
      {showLegend ? <StripLegend /> : null}
    </View>
  );
  },
);

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.xs,
  },
  listContent: {
    alignItems: 'flex-end',
    paddingVertical: spacing.xs,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 78,
  },
  pressable: {
    alignItems: 'center',
    gap: 4,
  },
  weekday: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    lineHeight: 14,
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  bubbleShell: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubblePeriod: {
    backgroundColor: colors.primary,
  },
  bubbleFertile: {
    backgroundColor: colors.tealTint,
    borderWidth: 1.5,
    borderColor: colors.secondary,
  },
  bubbleOvulation: {
    backgroundColor: colors.tealTint,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.secondary,
  },
  bubblePredicted: {
    backgroundColor: colors.roseTint,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  staticRing: {
    position: 'absolute',
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_RADIUS,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  staticRingToday: {
    borderColor: colors.primary,
  },
  staticRingSelected: {
    borderColor: colors.secondary,
    borderWidth: 2.5,
  },
  staticRingOnPeriod: {
    borderColor: colors.primaryText,
  },
  focusRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_RADIUS,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  focusRingOnFill: {
    borderColor: colors.primaryText,
  },
  dayNum: {
    fontSize: 15,
    fontWeight: '700',
  },
  marker: {
    marginTop: 1,
  },
  markerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 1,
  },
  markerPredicted: {
    backgroundColor: colors.roseTint,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  markerSpacer: {
    height: 6,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: spacing.md,
    rowGap: spacing.xs,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendPeriod: {
    backgroundColor: colors.primary,
  },
  legendFertile: {
    backgroundColor: colors.tealTint,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  legendPredicted: {
    backgroundColor: colors.roseTint,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  legendText: {
    fontSize: 11,
    lineHeight: 14,
  },
});
