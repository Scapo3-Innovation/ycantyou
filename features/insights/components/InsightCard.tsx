import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/theme';

type InsightCardProps = {
  title: string;
  children: ReactNode;
  compact?: boolean;
  /** Render inside a parent card — no outer Card chrome. */
  embedded?: boolean;
};

/** Shared card chrome for analytics insight sections. */
export function InsightCard({ title, children, compact = false, embedded = false }: InsightCardProps) {
  const titleStyle = [
    embedded || compact ? typography.sectionEyebrow : typography.h2,
    embedded || compact ? { fontSize: 11, lineHeight: 14 } : null,
    { color: embedded || compact ? colors.textFaint : colors.text },
  ];

  if (embedded) {
    return (
      <View style={styles.embedded}>
        <Text style={titleStyle}>{title.toUpperCase()}</Text>
        {children}
      </View>
    );
  }

  return (
    <Card>
      <Text style={titleStyle}>{compact ? title.toUpperCase() : title}</Text>
      {children}
    </Card>
  );
}

/** Friendly "not enough data yet" state used inside an InsightCard. */
export function InsightEmptyState({ message }: { message: string }) {
  return <Text style={[typography.body, { color: colors.textMuted }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  embedded: {
    gap: spacing.sm,
  },
});
