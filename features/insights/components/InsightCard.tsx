import type { ReactNode } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type InsightCardProps = {
  title: string;
  children: ReactNode;
};

/** Shared card chrome for the dashboard sections. */
export function InsightCard({ title, children }: InsightCardProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];
  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[typography.heading, { color: c.text }]}>{title}</Text>
      {children}
    </View>
  );
}

/** Friendly "not enough data yet" state used inside an InsightCard. */
export function InsightEmptyState({ message }: { message: string }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];
  return <Text style={[typography.body, { color: c.textMuted }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
});
