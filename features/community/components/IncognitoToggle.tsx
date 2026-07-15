import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type IncognitoToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  compact?: boolean;
};

/** Toggle anonymous posting — incognito on hides your name from other members. */
export function IncognitoToggle({ value, onChange, compact = false }: IncognitoToggleProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={value ? 'Posting anonymously' : 'Posting with your first name'}
      style={({ pressed }) => [styles.wrap, compact && styles.wrapCompact, pressed && styles.pressed]}>
      <View style={[styles.iconBtn, compact && styles.iconBtnCompact, value && styles.iconBtnActive]}>
        <Ionicons
          name={value ? 'eye-off-outline' : 'eye-outline'}
          size={compact ? 16 : 18}
          color={value ? colors.primary : colors.textMuted}
        />
      </View>
      <View style={styles.copy}>
        <Text style={[typography.captionMedium, { color: colors.text }]}>
          {value ? 'Anonymous' : 'Public name'}
        </Text>
        {compact ? null : (
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {value ? 'Others see “Anonymous”' : 'Others see your first name only'}
          </Text>
        )}
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
    flex: 1,
  },
  wrapCompact: {
    flex: 0,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  iconBtnCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
