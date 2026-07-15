import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type PremiumSectionProps = {
  label: string;
  children: ReactNode;
};

/** Grouped section — uppercase eyebrow label + stacked children with gap. */
export function PremiumSection({ label, children }: PremiumSectionProps) {
  return (
    <View style={styles.wrap}>
      <PremiumSectionLabel>{label}</PremiumSectionLabel>
      <View style={styles.stack}>{children}</View>
    </View>
  );
}

export function PremiumSectionLabel({ children }: { children: string }) {
  return (
    <Text style={[typography.sectionEyebrow, styles.label, { color: colors.textFaint }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    paddingHorizontal: spacing.xs,
  },
  stack: {
    gap: 7,
  },
});
