import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type ProfileHeaderProps = {
  fullName: string | null;
  onSettings: () => void;
  onBack?: () => void;
};

function firstName(fullName: string | null): string {
  const name = fullName?.trim().split(/\s+/)[0];
  return name && name.length > 0 ? name : 'there';
}

/** Profile top bar — back, title block, settings. */
export function ProfileHeader({ fullName, onSettings, onBack }: ProfileHeaderProps) {
  const name = firstName(fullName);

  return (
    <View style={styles.wrap}>
      <View style={styles.navRow}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.iconSpacer} />
        )}

        <Pressable
          onPress={onSettings}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
          <Ionicons name="settings-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.titleBlock}>
        <Text style={[typography.h1, { color: colors.text }]}>Hi, {name}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          You&apos;re taking charge of your health
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBlock: {
    gap: spacing.xs,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacer: {
    width: 40,
    height: 40,
  },
  pressed: {
    opacity: 0.88,
  },
});
