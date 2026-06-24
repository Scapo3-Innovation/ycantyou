import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, radius, shadows, spacing, typography } from '@/theme';

type HomeActionsProps = {
  onLogPeriod: () => void;
  onDailyLog: () => void;
  onScreener: () => void;
  onOpenTrack: () => void;
};

/** Primary home actions — large targets, no emoji, clear hierarchy. */
export function HomeActions({
  onLogPeriod,
  onDailyLog,
  onScreener,
  onOpenTrack,
}: HomeActionsProps) {
  return (
    <View style={styles.wrap}>
      <Animated.View entering={FadeInDown.delay(120).duration(450).springify()} style={styles.primaryRow}>
        <Pressable
          onPress={onDailyLog}
          accessibilityRole="button"
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
          <Ionicons name="add-circle-outline" size={22} color={colors.primaryText} />
          <Text style={styles.primaryLabel}>Log today</Text>
        </Pressable>
        <Pressable
          onPress={onLogPeriod}
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}>
          <Ionicons name="water-outline" size={20} color={colors.primary} />
          <Text style={styles.secondaryLabel}>Log period</Text>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(450).springify()} style={styles.linkRow}>
        <Pressable
          onPress={onOpenTrack}
          accessibilityRole="button"
          style={({ pressed }) => [styles.linkCard, pressed && styles.pressed]}>
          <View style={styles.linkIcon}>
            <Ionicons name="calendar-outline" size={20} color={colors.secondary} />
          </View>
          <View style={styles.linkText}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>Full calendar</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Period history, fertile window, reminders
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </Pressable>

        <Pressable
          onPress={onScreener}
          accessibilityRole="button"
          style={({ pressed }) => [styles.linkCard, pressed && styles.pressed]}>
          <View style={[styles.linkIcon, { backgroundColor: '#FDF0F4' }]}>
            <Ionicons name="clipboard-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.linkText}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>PCOS screener</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Screening tool — not a diagnosis
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  primaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.control,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    ...shadows.card,
  },
  primaryLabel: {
    ...typography.button,
    color: colors.primaryText,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 52,
    paddingHorizontal: spacing.sm,
  },
  secondaryLabel: {
    ...typography.button,
    color: colors.primary,
    fontSize: 14,
  },
  linkRow: {
    gap: spacing.sm,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#E8F5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.88,
  },
});
