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
  /** Selected option accent — profile screen uses teal. */
  accent?: 'primary' | 'secondary';
  /** Compact segments for profile and tight forms. */
  size?: 'default' | 'compact';
};

/** Segmented selector for sex assigned at birth — matches TextField layout. */
export function SexAtBirthField({
  label = 'Sex assigned at birth',
  hint,
  value,
  onChange,
  error,
  accent = 'primary',
  size = 'default',
}: SexAtBirthFieldProps) {
  const accentColor = accent === 'secondary' ? colors.secondary : colors.primary;
  const selectedBg = accent === 'secondary' ? colors.tealTint : colors.roseTint;
  const compact = size === 'compact';

  return (
    <View style={styles.container}>
      <Text style={[typography.captionMedium, { color: colors.textMuted }]}>{label}</Text>
      {hint ? (
        <Text style={[typography.caption, styles.hint, { color: colors.textFaint }]}>{hint}</Text>
      ) : null}
      <View style={styles.segmentRow}>
        {SEX_AT_BIRTH_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                compact ? styles.segmentCompact : styles.segment,
                {
                  backgroundColor: selected ? selectedBg : colors.surface,
                  borderColor: selected ? accentColor : colors.border,
                  borderWidth: selected ? 2 : 1,
                },
              ]}>
              <Text
                style={[
                  compact ? typography.captionMedium : typography.bodyMedium,
                  styles.segmentLabel,
                  { color: selected ? accentColor : colors.textMuted },
                ]}>
                {option.label}
              </Text>
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
  hint: {
    marginTop: -2,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  segmentCompact: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  segmentLabel: {
    textAlign: 'center',
  },
});
