import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

/** A tappable checkbox + label row. */
export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={styles.row}>
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? c.primary : c.border,
            backgroundColor: checked ? c.primary : 'transparent',
          },
        ]}>
        {checked ? <Ionicons name="checkmark" size={16} color={c.primaryText} /> : null}
      </View>
      <Text style={[typography.body, styles.label, { color: c.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  label: {
    flex: 1,
  },
});
