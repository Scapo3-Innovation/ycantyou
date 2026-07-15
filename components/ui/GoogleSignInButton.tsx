import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { SocialIconButton } from '@/components/ui/SocialIconButton';
import { colors, radius, spacing, typography } from '@/theme';

type GoogleSignInButtonProps = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Icon-only circle, or full-width row with label. */
  variant?: 'icon' | 'full';
};

/** Google OAuth entry — icon chip or full-width button. */
export function GoogleSignInButton({
  onPress,
  loading = false,
  disabled = false,
  variant = 'icon',
}: GoogleSignInButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'icon') {
    return (
      <SocialIconButton
        onPress={onPress}
        loading={loading}
        disabled={disabled}
        accessibilityLabel="Sign in with Google">
        <GoogleIcon size={28} />
      </SocialIconButton>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel="Continue with Google"
      style={[styles.fullButton, isDisabled && styles.buttonDisabled]}>
      <View style={styles.fullRow}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.textMuted} />
        ) : (
          <GoogleIcon size={22} />
        )}
        <Text style={[typography.button, { color: colors.text }]}>Continue with Google</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fullButton: {
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
