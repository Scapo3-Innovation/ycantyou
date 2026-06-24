import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@/theme';

type Action = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

type QuickActionsProps = {
  onLogPeriod: () => void;
  onDailyLog: () => void;
  onScreener: () => void;
};

/** Three big tap-targets for the most common actions, sized for budget Android. */
export function QuickActions({ onLogPeriod, onDailyLog, onScreener }: QuickActionsProps) {
  const actions: Action[] = [
    { icon: 'water-outline', label: 'Log period', onPress: onLogPeriod },
    { icon: 'create-outline', label: 'Daily log', onPress: onDailyLog },
    { icon: 'clipboard-outline', label: 'Screener', onPress: onScreener },
  ];

  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <Pressable
          key={action.label}
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={[styles.action, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name={action.icon} size={22} color={colors.primary} />
          </View>
          <Text style={[typography.caption, styles.label, { color: colors.text }]}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flex: 1,
    minHeight: 88,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    ...shadows.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
});
