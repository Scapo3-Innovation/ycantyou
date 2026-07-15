import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FEEDBACK_SCREEN } from '@/features/feedback/constants';
import { colors, radius, spacing, typography } from '@/theme';

type FeedbackMessageFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
};

/** Multiline message box with bottom-right character counter. */
export function FeedbackMessageField({
  value,
  onChangeText,
  placeholder,
  error,
}: FeedbackMessageFieldProps) {
  const count = value.length;
  const max = FEEDBACK_SCREEN.maxLength;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.inputShell,
          { borderColor: error ? colors.danger : colors.border },
        ]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          multiline
          maxLength={max}
          textAlignVertical="top"
          autoCorrect
          style={[typography.body, styles.input, { color: colors.text }]}
        />
      </View>
      <View style={styles.footer}>
        {error ? (
          <Text style={[typography.caption, styles.error, { color: colors.danger }]}>{error}</Text>
        ) : (
          <View />
        )}
        <Text style={[typography.caption, { color: colors.textFaint }]}>
          {count}/{max}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  inputShell: {
    minHeight: 168,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 136,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  error: {
    flex: 1,
    marginRight: spacing.sm,
  },
});
