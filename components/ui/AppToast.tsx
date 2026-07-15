import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing, typography } from '@/theme';

export type AppToastProps = {
  visible: boolean;
  message: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'default' | 'success' | 'rose';
  onHide: () => void;
};

const AUTO_DISMISS_MS = 2800;

/** Lightweight top toast — slide in, auto dismiss. */
export function AppToast({
  visible,
  message,
  subtitle,
  icon = 'checkmark-circle',
  tone = 'default',
  onHide,
}: AppToastProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, onHide, message]);

  if (!visible) return null;

  const iconColor =
    tone === 'success' ? colors.secondary : tone === 'rose' ? colors.primary : colors.text;
  const iconBg =
    tone === 'success' ? colors.tealTint : tone === 'rose' ? colors.roseTint : colors.surfaceAlt;

  return (
    <Animated.View
      entering={FadeInDown.duration(320).springify().damping(18)}
      exiting={FadeOutUp.duration(200)}
      style={[styles.wrap, { top: insets.top + spacing.sm }, shadows.glass]}
      pointerEvents="none">
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.copy}>
        <Text style={[typography.captionMedium, styles.message, { color: colors.text }]} numberOfLines={2}>
          {message}
        </Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 1,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
});
