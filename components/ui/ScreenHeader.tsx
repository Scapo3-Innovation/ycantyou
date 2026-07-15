import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type ScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
};

const ICON_SIZE = 40;

/** App header — centered title, rose-tint icon buttons (track/profile pattern). */
export function ScreenHeader({ title, subtitle, onBack, right }: ScreenHeaderProps) {
  const hasTitleBlock = Boolean(title || subtitle);

  return (
    <View style={styles.wrap} accessibilityLabel={title}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}

      {hasTitleBlock ? (
        <View style={styles.titleBlock}>
          {title ? (
            <Text style={[typography.h2, styles.title, { color: colors.text }]}>{title}</Text>
          ) : null}
          {subtitle ? (
            <Text style={[typography.caption, styles.subtitle, { color: colors.textMuted }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.titleBlock} />
      )}

      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

/** Rose-tint circular header button — use in ScreenHeader `right` slot. */
export function HeaderTextButton({
  label,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}>
      <Text style={[typography.captionMedium, { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

/** Rose-tint circular header button — use in ScreenHeader `right` slot. */
export function HeaderIconButton({
  icon,
  onPress,
  accessibilityLabel,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.iconButton,
        disabled && styles.disabled,
        pressed && !disabled ? styles.pressed : null,
      ]}>
      <Ionicons name={icon} size={20} color={disabled ? colors.textFaint : colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  iconButton: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    minWidth: ICON_SIZE,
    height: ICON_SIZE,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.45,
  },
});
