import { StyleSheet, Text, View } from 'react-native';

import { analyticsTypography } from '@/features/insights/components/analytics/analyticsStyles';
import { colors, radius, spacing } from '@/theme';

type AnalyticsInsightBannerProps = {
  headline: string;
  subline?: string;
  highlight?: string;
};

/** One-line takeaway below a chart — replaces stacked headline + subline blocks. */
export function AnalyticsInsightBanner({ headline, subline, highlight }: AnalyticsInsightBannerProps) {
  return (
    <View style={[styles.banner, { backgroundColor: colors.surfaceAlt }]}>
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
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
