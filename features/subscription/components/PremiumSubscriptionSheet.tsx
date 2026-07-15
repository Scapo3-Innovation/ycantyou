import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { useAppDialog } from '@/components/ui/AppDialogProvider';
import {
  PREMIUM_FEATURES,
  PREMIUM_PLANS,
  PREMIUM_TRIAL_DAYS,
  type SubscriptionPlanId,
} from '@/features/subscription/constants';
import { colors, radius, shadows, spacing, typography } from '@/theme';

type PremiumSubscriptionSheetProps = {
  visible: boolean;
  onClose: () => void;
};

function hapticSelect() {
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

/** Compact premium upsell — centered card, all content visible without scrolling. */
export function PremiumSubscriptionSheet({ visible, onClose }: PremiumSubscriptionSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { alert } = useAppDialog();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('yearly');

  const glow = useSharedValue(0);
  const cardScale = useSharedValue(0.94);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      glow.value = withRepeat(
        withSequence(withTiming(1, { duration: 1400 }), withTiming(0.4, { duration: 1400 })),
        -1,
        true,
      );
      cardScale.value = withSpring(1, { damping: 18, stiffness: 240 });
      cardOpacity.value = withTiming(1, { duration: 260 });
    } else {
      cardScale.value = 0.94;
      cardOpacity.value = 0;
    }
  }, [visible, glow, cardOpacity, cardScale]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.9 + glow.value * 0.14 }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  function onSelectPlan(planId: SubscriptionPlanId) {
    hapticSelect();
    setSelectedPlan(planId);
  }

  function onStartTrial() {
    hapticSelect();
    alert(
      'Premium coming soon',
      `Subscriptions are not live yet. When they launch, you\u2019ll get a ${PREMIUM_TRIAL_DAYS}-day free trial before any charge.`,
      [{ text: 'OK', onPress: onClose }],
    );
  }

  const verticalPad = Math.max(insets.top, spacing.lg) + Math.max(insets.bottom, spacing.lg);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={[styles.root, { paddingVertical: verticalPad }]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={32} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={styles.androidBackdrop} />
        )}

        <Pressable style={styles.dismissArea} onPress={onClose} accessibilityRole="button" />

        <Animated.View
          style={[
            styles.card,
            shadows.glass,
            cardStyle,
            { maxHeight: windowHeight - verticalPad * 2 },
          ]}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={8}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </Pressable>

          <Animated.View entering={FadeInDown.duration(380).springify()} style={styles.header}>
            <Animated.View style={[styles.iconGlow, glowStyle]} />
            <View style={styles.iconWrap}>
              <Ionicons name="ribbon" size={22} color={colors.primary} />
            </View>
            <Text style={[typography.h2, styles.headline, { color: colors.text }]}>
              Try Premium free for {PREMIUM_TRIAL_DAYS} days
            </Text>
            <Text style={[typography.caption, styles.subtitle, { color: colors.textMuted }]}>
              Your full PCOS & wellness toolkit — no limits.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(100).duration(320)} style={styles.featureGrid}>
            {PREMIUM_FEATURES.map((feature, index) => {
              const tintBg = feature.tint === 'rose' ? colors.roseTint : colors.tealTint;
              const tintIcon = feature.tint === 'rose' ? colors.primary : colors.secondary;

              return (
                <Animated.View
                  key={feature.title}
                  entering={FadeInDown.delay(140 + index * 50)
                    .duration(360)
                    .springify()}
                  style={styles.featureCell}>
                  <View style={[styles.featureIcon, { backgroundColor: tintBg }]}>
                    <Ionicons name={feature.icon} size={14} color={tintIcon} />
                  </View>
                  <Text style={[typography.captionMedium, styles.featureLabel, { color: colors.text }]}>
                    {feature.shortTitle}
                  </Text>
                </Animated.View>
              );
            })}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(380)} style={styles.plansRow}>
            {PREMIUM_PLANS.map((plan) => {
              const selected = plan.id === selectedPlan;
              return (
                <Pressable
                  key={plan.id}
                  onPress={() => onSelectPlan(plan.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.planCard,
                    selected && styles.planCardSelected,
                    pressed && styles.pressed,
                  ]}>
                  {plan.savings ? (
                    <View style={styles.savingsBadge}>
                      <Text style={[typography.captionMedium, styles.savingsText, { color: colors.secondaryText }]}>
                        {plan.savings}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={[typography.captionMedium, { color: colors.textMuted }]}>{plan.label}</Text>
                  <Text style={[typography.h2, styles.planPrice, { color: colors.text }]}>{plan.price}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>{plan.period}</Text>
                </Pressable>
              );
            })}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(380).duration(380)} style={styles.actions}>
            <Button
              label={`Start ${PREMIUM_TRIAL_DAYS}-day free trial`}
              onPress={onStartTrial}
              leftIcon="sparkles-outline"
              style={styles.cta}
            />
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [styles.laterBtn, pressed && styles.pressed]}>
              <Text style={[typography.captionMedium, { color: colors.textMuted }]}>Maybe later</Text>
            </Pressable>
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
    paddingHorizontal: spacing.lg,
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  iconGlow: {
    position: 'absolute',
    top: 0,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.roseTint,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  headline: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 18,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureCell: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  plansRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  planCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    gap: 2,
    position: 'relative',
    minHeight: 88,
    justifyContent: 'center',
  },
  planCardSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.tealTint,
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  savingsText: {
    fontSize: 10,
    lineHeight: 13,
  },
  planPrice: {
    fontSize: 22,
    lineHeight: 28,
  },
  actions: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  cta: {
    minHeight: 48,
  },
  laterBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
});
