import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, typography } from '@/theme';

type InsightCardProps = {
  title: string;
  children: ReactNode;
};

/** Shared card chrome for the dashboard sections. */
export function InsightCard({ title, children }: InsightCardProps) {
  return (
    <Card>
      <Text style={[typography.h2, { color: colors.text }]}>{title}</Text>
      {children}
    </Card>
  );
}

/** Friendly "not enough data yet" state used inside an InsightCard. */
export function InsightEmptyState({ message }: { message: string }) {
  return <Text style={[typography.body, { color: colors.textMuted }]}>{message}</Text>;
}
