import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
};

/** A tappable checkbox + label row. */
export function Checkbox({ checked, onChange, label, disabled = false }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => {
        if (!disabled) onChange(!checked);
      }}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      style={[styles.row, disabled && styles.disabled]}>
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? colors.primary : colors.border,
            backgroundColor: checked ? colors.primary : 'transparent',
          },
        ]}>
        {checked ? <Ionicons name="checkmark" size={16} color={colors.primaryText} /> : null}
      </View>
      <Text style={[typography.body, styles.label, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
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
  disabled: {
    opacity: 0.45,
  },
});
