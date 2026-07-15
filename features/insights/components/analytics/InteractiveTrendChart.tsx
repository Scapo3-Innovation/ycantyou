import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { analyticsTypography } from '@/features/insights/components/analytics/analyticsStyles';
import type { TrendPoint } from '@/features/insights/analyticsSeries';
import { colors, radius, spacing } from '@/theme';

const CHART_HEIGHT = 108;

type InteractiveTrendChartProps = {
  points: TrendPoint[];
  selectedIndex: number | null;
  onSelectIndex: (index: number | null) => void;
};

function hapticTap() {
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

/** Tap a bar to inspect mood, energy, and check-ins for that bucket. */
export function InteractiveTrendChart({
  points,
  selectedIndex,
  onSelectIndex,
}: InteractiveTrendChartProps) {
  const maxScore = Math.max(100, ...points.map((point) => point.score ?? 0));

  if (points.every((point) => point.logCount === 0)) {
    return (
      <View style={styles.empty}>
        <Text style={[analyticsTypography.body, { color: colors.textMuted }]}>
          No check-ins in this period yet. Log mood or energy to see your trend.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.plot, { height: CHART_HEIGHT }]}>
        {points.map((point, index) => {
          const selected = selectedIndex === index;
          const score = point.score ?? 0;
          const barHeight = point.score == null ? 6 : Math.max(10, (score / maxScore) * CHART_HEIGHT);
          return (
            <Pressable
              key={point.key}
              onPress={() => {
                hapticTap();
                onSelectIndex(selected ? null : index);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${point.label}, ${point.logCount} check-ins`}
              style={({ pressed }) => [
                styles.barCol,
                pressed && styles.pressed,
              ]}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: point.score == null ? colors.border : colors.secondary,
                      opacity: selected || selectedIndex == null ? 1 : 0.45,
                    },
                    selected && styles.barSelected,
                  ]}
                />
              </View>
              <Text
                style={[
                  analyticsTypography.micro,
                  styles.label,
                  { color: selected ? colors.text : colors.textFaint },
                ]}
                numberOfLines={1}>
                {point.label}
              </Text>
            </Pressable>
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
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  barTrack: {
    width: '100%',
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '72%',
    borderRadius: radius.sm,
    minHeight: 6,
  },
  barSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  label: {
    textAlign: 'center',
  },
  empty: {
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.92,
  },
});
