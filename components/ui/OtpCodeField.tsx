import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { normalizeOtpInput, OTP_MAX_LENGTH } from '@/features/auth/otp';
import { colors, radius, spacing, typography } from '@/theme';

type OtpCodeFieldProps = {
  label?: string;
  error?: string;
  value: string;
  onChangeText: (value: string) => void;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType' | 'maxLength'>;

/** Numeric code input — matches TextField layout with spaced digits. */
export const OtpCodeField = forwardRef<TextInput, OtpCodeFieldProps>(function OtpCodeField(
  { label = 'Verification code', error, value, onChangeText, style, ...inputProps },
  ref,
) {
  return (
    <View style={styles.container}>
      <Text style={[typography.captionMedium, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(text) => onChangeText(normalizeOtpInput(text))}
        placeholder="Enter code"
        placeholderTextColor={colors.textFaint}
        keyboardType="number-pad"
        inputMode="numeric"
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        maxLength={OTP_MAX_LENGTH}
        returnKeyType="done"
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
    textAlign: 'center',
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  },
});
