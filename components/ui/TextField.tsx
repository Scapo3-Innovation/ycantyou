import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type TextFieldProps = {
  label: string;
  error?: string;
} & TextInputProps;

/** Labelled text input with an error message slot. Password fields get a show/hide toggle. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, style, secureTextEntry, ...inputProps },
  ref,
) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPasswordField = secureTextEntry === true;

  return (
    <View style={styles.container}>
      <Text style={[typography.captionMedium, { color: colors.textMuted }]}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textFaint}
          secureTextEntry={isPasswordField ? !passwordVisible : secureTextEntry}
          style={[
            typography.body,
            styles.input,
            isPasswordField && styles.inputWithToggle,
            {
              color: colors.text,
              backgroundColor: colors.surface,
              borderColor: error ? colors.danger : colors.border,
            },
            style,
          ]}
          {...inputProps}
        />
        {isPasswordField ? (
          <Pressable
            onPress={() => setPasswordVisible((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            hitSlop={8}
            style={styles.toggle}>
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
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
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
  },
  inputWithToggle: {
    paddingRight: spacing.xl + spacing.lg,
  },
  toggle: {
    position: 'absolute',
    right: spacing.md,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
