import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type ListItemProps = {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  right?: ReactNode;
  onPress?: () => void;
};

/** A row inside a Card/list: optional leading icon, title + subtitle, trailing slot or chevron. */
export function ListItem({ title, subtitle, leftIcon, right, onPress }: ListItemProps) {
  const content = (
    <>
      {leftIcon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={leftIcon} size={18} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text style={[typography.body, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textFaint} /> : null)}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.row}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
});
