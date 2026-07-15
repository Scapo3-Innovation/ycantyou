import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type PartnerCodeFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

/** Six-character invite code entry for partner onboarding. */
export function PartnerCodeField({ value, onChange, error }: PartnerCodeFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={[typography.captionMedium, styles.label, { color: colors.textMuted }]}>
        Partner code
      </Text>
      <TextInput
        value={value}
        onChangeText={(text) => onChange(text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
        placeholder="ABC123"
        placeholderTextColor={colors.textFaint}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.surface,
          },
        ]}
        accessibilityLabel="Partner invite code"
      />
      <Text style={[typography.caption, { color: colors.textFaint }]}>
        Enter the 6-character code she shared with you.
      </Text>
      {error ? (
        <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    ...typography.h2,
    letterSpacing: 8,
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
});
