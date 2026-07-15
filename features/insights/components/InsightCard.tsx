import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, typography } from '@/theme';

type InsightCardProps = {
  title: string;
  children: ReactNode;
  compact?: boolean;
};

/** Shared card chrome for analytics insight sections. */
export function InsightCard({ title, children, compact = false }: InsightCardProps) {
  return (
    <Card>
      <Text
        style={[
          compact ? typography.sectionEyebrow : typography.h2,
          compact && { fontSize: 11, lineHeight: 14 },
          { color: compact ? colors.textFaint : colors.text },
        ]}>
        {compact ? title.toUpperCase() : title}
      </Text>
      {children}
    </Card>
  );
}

/** Friendly "not enough data yet" state used inside an InsightCard. */
export function InsightEmptyState({ message }: { message: string }) {
  return <Text style={[typography.body, { color: colors.textMuted }]}>{message}</Text>;
}
