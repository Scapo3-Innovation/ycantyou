import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type TextFieldProps = {
  label: string;
  error?: string;
} & TextInputProps;

/** Labelled text input with an error message slot. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, style, ...inputProps },
  ref,
) {
  return (
    <View style={styles.container}>
      <Text style={[typography.captionMedium, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textFaint}
        style={[
          typography.body,
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
          style,
        ]}
        {...inputProps}
      />
      {error ? (
        <Text style={[typography.caption, { color: colors.danger }]} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
  },
});
