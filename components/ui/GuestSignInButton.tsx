import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { SocialIconButton } from '@/components/ui/SocialIconButton';
import { colors, radius, spacing, typography } from '@/theme';

type GuestSignInButtonProps = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Icon-only circle, or full-width row with label. */
  variant?: 'icon' | 'full';
};

/** DEV guest sign-in — icon chip or full-width button. */
export function GuestSignInButton({
  onPress,
  loading = false,
  disabled = false,
  variant = 'full',
}: GuestSignInButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'icon') {
    return (
      <SocialIconButton
        onPress={onPress}
        loading={loading}
        disabled={disabled}
        accessibilityLabel="Continue as guest">
        <Ionicons name="person-outline" size={26} color={colors.secondary} />
      </SocialIconButton>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel="Continue as guest"
      style={[styles.fullButton, isDisabled && styles.buttonDisabled]}>
      <View style={styles.fullRow}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.textMuted} />
        ) : (
          <Ionicons name="person-outline" size={22} color={colors.secondary} />
        )}
        <Text style={[typography.button, { color: colors.text }]}>Continue as guest</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fullButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  fullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
