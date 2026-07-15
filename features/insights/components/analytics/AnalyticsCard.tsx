import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { analyticsTypography } from '@/features/insights/components/analytics/analyticsStyles';
import { colors, spacing } from '@/theme';

type AnalyticsCardProps = {
  title: string;
  children: ReactNode;
};

/** Compact card chrome for the analytics tab. */
export function AnalyticsCard({ title, children }: AnalyticsCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={[analyticsTypography.section, { color: colors.text }]}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  body: {
    gap: spacing.sm,
  },
});
