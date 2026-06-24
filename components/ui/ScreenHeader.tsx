import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type ScreenHeaderProps = {
  /** Used for screen reader context only — not shown as a large page title. */
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
};

/** Compact page header: optional back button, optional subtitle, optional right slot. */
export function ScreenHeader({ title, subtitle, onBack, right }: ScreenHeaderProps) {
  const hasTopRow = Boolean(onBack || right);
  const hasSubtitle = Boolean(subtitle);

  if (!hasTopRow && !hasSubtitle) return null;

  return (
    <View style={styles.container} accessibilityLabel={title}>
      {hasTopRow ? (
        <View style={styles.topRow}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              style={styles.back}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
          ) : (
            <View />
          )}
          {right ?? null}
        </View>
      ) : null}
      {hasSubtitle ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 40,
    height: 40,
    marginLeft: -spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
