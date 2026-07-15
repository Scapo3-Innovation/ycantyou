import { Pressable, StyleSheet, Text, View } from 'react-native';

import { analyticsTypography } from '@/features/insights/components/analytics/analyticsStyles';
import { colors, radius, spacing } from '@/theme';

export type AnalyticsMetric = 'signs' | 'wellness';

const METRICS: { value: AnalyticsMetric; label: string }[] = [
  { value: 'signs', label: 'PCOS signs' },
  { value: 'wellness', label: 'Wellness' },
];

type AnalyticsMetricTabsProps = {
  value: AnalyticsMetric;
  onChange: (metric: AnalyticsMetric) => void;
};

/** Switch between PCOS sign trend and wellness trend without stacking two charts. */
export function AnalyticsMetricTabs({ value, onChange }: AnalyticsMetricTabsProps) {
  return (
    <View style={styles.wrap}>
      {METRICS.map((metric) => {
        const selected = metric.value === value;
        return (
          <Pressable
            key={metric.value}
            onPress={() => onChange(metric.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
            <Text
              style={[
                analyticsTypography.bodyMedium,
                { color: selected ? colors.text : colors.textMuted },
              ]}>
              {metric.label}
            </Text>
            {selected ? (
              <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
            ) : (
              <View style={styles.indicatorSpacer} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  indicator: {
    height: 2,
    width: 48,
    borderRadius: 1,
  },
  indicatorSpacer: {
    height: 2,
  },
  pressed: {
    opacity: 0.85,
  },
});
