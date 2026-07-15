import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/theme';

type FormSectionProps = {
  title: string;
  children: ReactNode;
  style?: ViewStyle;
};

/** Section title + white card — used on form/detail screens. */
export function FormSection({ title, children, style }: FormSectionProps) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={[typography.bodyMedium, { color: colors.text }]}>{title}</Text>
      <Card style={styles.card}>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.md,
  },
});
