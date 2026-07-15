import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type IncognitoToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

/** Toggle anonymous posting — incognito on hides your name from other members. */
export function IncognitoToggle({ value, onChange }: IncognitoToggleProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={value ? 'Posting anonymously' : 'Posting with your first name'}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <View style={[styles.iconBtn, value && styles.iconBtnActive]}>
        <Ionicons
          name={value ? 'eye-off-outline' : 'eye-outline'}
          size={18}
          color={value ? colors.primary : colors.textMuted}
        />
      </View>
      <View style={styles.copy}>
        <Text style={[typography.captionMedium, { color: colors.text }]}>
          {value ? 'Anonymous' : 'Public name'}
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          {value ? 'Others see “Anonymous”' : 'Others see your first name only'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  iconBtnActive: {
    backgroundColor: colors.roseTint,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.9,
  },
});
