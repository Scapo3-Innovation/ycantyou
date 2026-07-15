import { StyleSheet, Text, View } from 'react-native';

import { analyticsTypography } from '@/features/insights/components/analytics/analyticsStyles';
import { colors, radius, spacing } from '@/theme';

type AnalyticsInsightBannerProps = {
  headline: string;
  subline?: string;
  highlight?: string;
};

/** One-line takeaway below a chart. */
export function AnalyticsInsightBanner({ headline, subline, highlight }: AnalyticsInsightBannerProps) {
  return (
    <View style={[styles.banner, { borderLeftColor: colors.primary }]}>
      <Text style={[analyticsTypography.body, { color: colors.text }]}>
        {headline}
        {highlight ? (
          <Text style={[analyticsTypography.bodyMedium, { color: colors.secondary }]}>
            {' '}
            {highlight}
          </Text>
        ) : null}
      </Text>
      {subline ? (
        <Text style={[analyticsTypography.micro, { color: colors.textMuted }]}>{subline}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
});
