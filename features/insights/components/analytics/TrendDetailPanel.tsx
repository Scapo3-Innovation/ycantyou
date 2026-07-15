import { StyleSheet, Text, View } from 'react-native';

import { analyticsTypography } from '@/features/insights/components/analytics/analyticsStyles';
import { formatTrendRange, type TrendPoint } from '@/features/insights/analyticsSeries';
import { colors, radius, spacing } from '@/theme';

type TrendDetailPanelProps = {
  point: TrendPoint | null;
};

function metricLabel(value: number | null, suffix = '/5'): string {
  if (value == null) return '—';
  return `${value.toFixed(1)}${suffix}`;
}

/** Detail card shown when a chart bar is selected. */
export function TrendDetailPanel({ point }: TrendDetailPanelProps) {
  if (!point) return null;

  return (
    <View style={styles.panel}>
      <Text style={[analyticsTypography.bodyMedium, { color: colors.textMuted }]}>
        {formatTrendRange(point)}
      </Text>
      <View style={styles.metrics}>
        <Metric label="Wellness" value={point.score == null ? '—' : `${Math.round(point.score)}%`} />
        <Metric label="Mood" value={metricLabel(point.mood)} />
        <Metric label="Energy" value={metricLabel(point.energy)} />
        <Metric
          label="Check-ins"
          value={String(point.logCount)}
          suffix=""
        />
      </View>
    </View>
  );
}

function Metric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={[analyticsTypography.micro, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[analyticsTypography.bodyMedium, { color: colors.text }]}>
        {value}
        {suffix}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metric: {
    minWidth: '42%',
    gap: 2,
  },
});
