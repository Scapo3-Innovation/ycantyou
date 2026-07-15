import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/theme';

type PremiumListItemProps = {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  right?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
};

/** Standalone premium row — own card, square icon tile, chevron. */
export function PremiumListItem({
  title,
  subtitle,
  leftIcon,
  right,
  onPress,
  style,
}: PremiumListItemProps) {
  const content = (
    <View style={styles.row}>
      {leftIcon ? (
        <View style={styles.iconTile}>
          <Ionicons name={leftIcon} size={18} color={colors.text} />
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text style={[typography.bodyMedium, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ??
        (onPress ? (
          <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
        ) : null)}
    </View>
  );

  if (!onPress) {
    return <Card style={[styles.card, style]}>{content}</Card>;
  }

  return (
    <Card style={[styles.card, style]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.92,
  },
});
