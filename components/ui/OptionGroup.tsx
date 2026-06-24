import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type Option<T extends string> = { value: T; label: string; description?: string };

type OptionGroupProps<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
};

/** Single-select list of options (e.g. main goal). */
export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: OptionGroupProps<T>) {
  return (
    <View style={styles.container}>
      <Text style={[typography.caption, styles.label, { color: colors.textMuted }]}>{label}</Text>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={
              option.description ? `${option.label}. ${option.description}` : option.label
            }
            style={[
              styles.option,
              {
                backgroundColor: selected ? colors.surfaceAlt : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
                borderWidth: selected ? 2 : 1,
              },
            ]}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>{option.label}</Text>
            {option.description ? (
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {option.description}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
      {error ? <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontWeight: '600',
  },
  option: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
