import { Pressable, StyleSheet, Text, View } from 'react-native';

import { analyticsTypography } from '@/features/insights/components/analytics/analyticsStyles';
import type { AnalyticsPeriod } from '@/features/insights/analyticsSeries';
import { colors, radius, spacing } from '@/theme';

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '4w', label: '4 weeks' },
  { value: '3m', label: '3 months' },
];

type AnalyticsPeriodTabsProps = {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
};

/** Segmented control for analytics time range. */
export function AnalyticsPeriodTabs({ value, onChange }: AnalyticsPeriodTabsProps) {
  return (
    <View style={styles.wrap}>
      {PERIODS.map((period) => {
        const selected = period.value === value;
        return (
          <Pressable
            key={period.value}
            onPress={() => onChange(period.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Show ${period.label}`}
            style={({ pressed }) => [
              styles.tab,
              selected && styles.tabSelected,
              pressed && styles.pressed,
            ]}>
            <Text
              style={[
                analyticsTypography.bodyMedium,
                { color: selected ? colors.primaryText : colors.textMuted, fontSize: 13 },
              ]}>
              {period.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  tabSelected: {
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.9,
  },
});
