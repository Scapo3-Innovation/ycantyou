import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type Option<T extends string> = { value: T; label: string; description?: string };

type OptionGroupProps<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
  /** Tighter rows for onboarding — fits all options without scrolling. */
  variant?: 'default' | 'compact';
  hideLabel?: boolean;
};

/** Single-select list of options (e.g. main goal). */
export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  variant = 'default',
  hideLabel = false,
}: OptionGroupProps<T>) {
  const compact = variant === 'compact';

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {!hideLabel ? (
        <Text style={[typography.captionMedium, { color: colors.textMuted }]}>{label}</Text>
      ) : null}
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
              compact ? styles.optionCompact : styles.option,
              {
                backgroundColor: selected ? colors.surfaceAlt : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
                borderWidth: selected ? 2 : 1,
              },
            ]}>
            <Text
              style={[
                compact ? typography.bodyMedium : typography.bodyMedium,
                { color: colors.text },
              ]}>
              {option.label}
            </Text>
            {option.description ? (
              <Text
                style={[typography.caption, { color: colors.textMuted }]}
                numberOfLines={compact ? 1 : undefined}>
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
  containerCompact: {
    gap: spacing.xs,
  },
  option: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  optionCompact: {
    minHeight: 44,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    gap: 2,
  },
});
