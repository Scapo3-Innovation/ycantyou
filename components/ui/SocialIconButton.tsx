import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { colors, shadows } from '@/theme';

const ICON_SIZE = 56;

type SocialIconButtonProps = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  children: ReactNode;
};

/** Circular sign-in chip — Google, guest, etc. */
export function SocialIconButton({
  onPress,
  loading = false,
  disabled = false,
  accessibilityLabel,
  children,
}: SocialIconButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, isDisabled && styles.buttonDisabled]}>
      {loading ? <ActivityIndicator size="small" color={colors.textMuted} /> : children}
    </Pressable>
  );
}

export const socialIconButtonSize = ICON_SIZE;

const styles = StyleSheet.create({
  button: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
