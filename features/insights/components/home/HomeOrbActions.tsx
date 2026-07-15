import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, radius, spacing, typography } from '@/theme';

type HomeOrbActionsProps = {
  onEditPeriod: () => void;
  onDailyLog: () => void;
  onScreener: () => void;
};

/** Circular quick actions — reference-style orb buttons. */
export function HomeOrbActions({ onEditPeriod, onDailyLog, onScreener }: HomeOrbActionsProps) {
  return (
    <Animated.View entering={FadeInDown.delay(100).duration(450).springify()} style={styles.row}>
      <OrbAction
        icon="water"
        label="Edit period"
        filled
        onPress={onEditPeriod}
        accessibilityLabel="Edit period"
      />
      <OrbAction
        icon="happy-outline"
        label="Daily log"
        onPress={onDailyLog}
        accessibilityLabel="Log symptoms for this day"
      />
      <OrbAction
        icon="clipboard-outline"
        label="Screener"
        onPress={onScreener}
        accessibilityLabel="Open PCOS screener"
      />
    </Animated.View>
  );
}

function OrbAction({
  icon,
  label,
  onPress,
  filled = false,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  filled?: boolean;
  accessibilityLabel: string;
}) {
  return (
    <View style={styles.item}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          styles.orb,
          filled ? styles.orbFilled : styles.orbGhost,
          pressed && styles.pressed,
        ]}>
        <Ionicons
          name={icon}
          size={22}
          color={filled ? colors.primaryText : colors.primary}
        />
      </Pressable>
      <Text style={[typography.caption, styles.label, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  item: {
    alignItems: 'center',
    gap: spacing.sm,
    width: 88,
  },
  orb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbFilled: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  orbGhost: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  label: {
    textAlign: 'center',
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
