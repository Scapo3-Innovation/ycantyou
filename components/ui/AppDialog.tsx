import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export type AppDialogButtonStyle = 'default' | 'cancel' | 'destructive';

export type AppDialogButton = {
  text: string;
  style?: AppDialogButtonStyle;
  onPress?: () => void;
};

export type AppDialogTone = 'default' | 'success' | 'danger' | 'rose';

export type AppDialogConfig = {
  title: string;
  message?: string;
  buttons?: AppDialogButton[];
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: AppDialogTone;
};

type AppDialogProps = {
  visible: boolean;
  config: AppDialogConfig | null;
  onClose: () => void;
};

const TONE_ICONS: Record<AppDialogTone, keyof typeof Ionicons.glyphMap> = {
  default: 'information-circle-outline',
  success: 'checkmark-circle-outline',
  danger: 'warning-outline',
  rose: 'sparkles-outline',
};

const TONE_ICON_BG: Record<AppDialogTone, string> = {
  default: colors.surfaceAlt,
  success: colors.tealTint,
  danger: 'rgba(229, 72, 77, 0.12)',
  rose: colors.roseTint,
};

const TONE_ICON_COLOR: Record<AppDialogTone, string> = {
  default: colors.text,
  success: colors.secondary,
  danger: colors.danger,
  rose: colors.primary,
};

function inferTone(config: AppDialogConfig): AppDialogTone {
  if (config.tone) return config.tone;
  const title = config.title.toLowerCase();
  if (title.includes('thank') || title.includes('linked') || title.includes('success')) {
    return 'success';
  }
  if (
    config.buttons?.some((button) => button.style === 'destructive') ||
    title.includes('delete') ||
    title.includes('disconnect') ||
    title.includes('revoke')
  ) {
    return 'danger';
  }
  if (title.includes('premium')) return 'rose';
  return 'default';
}

/** Themed centered dialog — replaces native Alert.alert. */
export function AppDialog({ visible, config, onClose }: AppDialogProps) {
  const scale = useSharedValue(0.94);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 18, stiffness: 240 });
      opacity.value = withTiming(1, { duration: 220 });
    } else {
      scale.value = 0.94;
      opacity.value = 0;
    }
  }, [visible, opacity, scale]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!config) return null;

  const tone = inferTone(config);
  const icon = config.icon ?? TONE_ICONS[tone];
  const buttons =
    config.buttons && config.buttons.length > 0 ? config.buttons : [{ text: 'OK' }];

  const cancelButtons = buttons.filter((button) => button.style === 'cancel');
  const actionButtons = buttons.filter((button) => button.style !== 'cancel');
  const useRowActions =
    buttons.length === 2 && cancelButtons.length === 1 && actionButtons.length === 1;

  function onPressButton(button: AppDialogButton) {
    onClose();
    button.onPress?.();
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={32} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={styles.androidBackdrop} />
        )}

        <Pressable style={styles.dismissArea} onPress={onClose} accessibilityRole="button" />

        <Animated.View style={[styles.card, shadows.glass, cardStyle]}>
          <Animated.View entering={FadeIn.duration(260)} style={styles.content}>
            <View style={[styles.iconWrap, { backgroundColor: TONE_ICON_BG[tone] }]}>
              <Ionicons name={icon} size={22} color={TONE_ICON_COLOR[tone]} />
            </View>

            <Text style={[typography.h2, styles.title, { color: colors.text }]}>{config.title}</Text>

            {config.message ? (
              <Text style={[typography.body, styles.message, { color: colors.textMuted }]}>
                {config.message}
              </Text>
            ) : null}

            {useRowActions ? (
              <View style={styles.rowActions}>
                {cancelButtons.map((button) => (
                  <Button
                    key={button.text}
                    label={button.text}
                    variant="secondary"
                    onPress={() => onPressButton(button)}
                    style={styles.rowBtn}
                  />
                ))}
                {actionButtons.map((button) => (
                  <Button
                    key={button.text}
                    label={button.text}
                    variant={button.style === 'destructive' ? 'danger' : 'primary'}
                    onPress={() => onPressButton(button)}
                    style={styles.rowBtn}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.stackActions}>
                {actionButtons.map((button) => (
                  <Button
                    key={button.text}
                    label={button.text}
                    variant={button.style === 'destructive' ? 'danger' : 'primary'}
                    onPress={() => onPressButton(button)}
                  />
                ))}
                {cancelButtons.map((button) => (
                  <Pressable
                    key={button.text}
                    onPress={() => onPressButton(button)}
                    accessibilityRole="button"
                    hitSlop={8}
                    style={({ pressed }) => [styles.cancelLink, pressed && styles.pressed]}>
                    <Text style={[typography.captionMedium, { color: colors.textMuted }]}>
                      {button.text}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  androidBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 28, 30, 0.45)',
  },
  dismissArea: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 26,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    paddingTop: spacing.xs,
  },
  rowBtn: {
    flex: 1,
    minHeight: 48,
  },
  stackActions: {
    width: '100%',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
});
