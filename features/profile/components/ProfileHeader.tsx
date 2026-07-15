import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type ProfileHeaderProps = {
  onBack?: () => void;
};

/** Profile top bar — title left, back right. */
export function ProfileHeader({ onBack }: ProfileHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.titleBlock}>
        <Text style={[typography.bodyMedium, styles.title, { color: colors.text }]}>Profile</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Your health identity</Text>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
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
