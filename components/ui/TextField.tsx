import { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  type TextInputProps,
} from 'react-native';

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
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, styles.label, { color: c.textMuted }]}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={c.textMuted}
        style={[
          typography.body,
          styles.input,
          { color: c.text, backgroundColor: c.surface, borderColor: error ? c.danger : c.border },
          style,
        ]}
        {...inputProps}
      />
      {error ? (
        <Text style={[typography.caption, { color: c.danger }]} accessibilityLiveRegion="polite">
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
  label: {
    fontWeight: '600',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
});
