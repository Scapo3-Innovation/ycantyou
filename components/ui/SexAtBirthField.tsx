import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SEX_AT_BIRTH_OPTIONS } from '@/features/onboarding/constants';
import { colors, radius, spacing, typography } from '@/theme';
import type { SexAtBirth } from '@/types/database';

type SexAtBirthFieldProps = {
  label?: string;
  hint?: string;
  value: SexAtBirth | null;
  onChange: (value: SexAtBirth) => void;
  error?: string;
};

/** Compact chip selector for sex assigned at birth. */
export function SexAtBirthField({
  label = 'Sex assigned at birth',
  hint = 'Helps us tailor cycle and health insights.',
  value,
  onChange,
  error,
}: SexAtBirthFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={[typography.caption, styles.label, { color: colors.textMuted }]}>{label}</Text>
      {hint ? (
        <Text style={[typography.caption, { color: colors.textFaint }]}>{hint}</Text>
      ) : null}
      <View style={styles.chips}>
        {SEX_AT_BIRTH_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.surfaceAlt : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  borderWidth: selected ? 2 : 1,
                },
              ]}>
              <Text style={[typography.body, { color: colors.text }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text style={[typography.caption, { color: colors.danger }]} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontWeight: '600',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  chip: {
    minHeight: 44,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
});
