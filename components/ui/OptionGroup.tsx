import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type Option<T extends string> = { value: T; label: string };

type OptionGroupProps<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
};

/** Single-select list of options (used for goal and language). */
export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: OptionGroupProps<T>) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, styles.label, { color: c.textMuted }]}>{label}</Text>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[
              styles.option,
              {
                backgroundColor: c.surface,
                borderColor: selected ? c.primary : c.border,
                borderWidth: selected ? 2 : 1,
              },
            ]}>
            <Text style={[typography.body, { color: c.text }]}>{option.label}</Text>
          </Pressable>
        );
      })}
      {error ? <Text style={[typography.caption, { color: c.danger }]}>{error}</Text> : null}
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
    justifyContent: 'center',
  },
});
