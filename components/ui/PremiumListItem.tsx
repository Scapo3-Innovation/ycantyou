import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, radius, typography } from '@/theme';

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
          <Ionicons name={leftIcon} size={COMPACT.iconGlyph} color={colors.text} />
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
          <Ionicons name="chevron-forward" size={COMPACT.chevron} color={colors.textFaint} />
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

const COMPACT = {
  rowMinHeight: 61,
  padH: 15,
  padV: 11,
  gap: 11,
  icon: 34,
  iconGlyph: 17,
  chevron: 15,
} as const;

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COMPACT.gap,
    minHeight: COMPACT.rowMinHeight,
    paddingHorizontal: COMPACT.padH,
    paddingVertical: COMPACT.padV,
  },
  iconTile: {
    width: COMPACT.icon,
    height: COMPACT.icon,
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
