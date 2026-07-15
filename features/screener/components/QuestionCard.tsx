import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type QuestionCardProps = {
  text: string;
  value: boolean | null;
  onAnswer: (value: boolean) => void;
  disabled?: boolean;
};

type OptionProps = {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

function AnswerOption({ label, selected, disabled, onPress }: OptionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.option,
        selected ? styles.optionSelected : styles.optionIdle,
        pressed && !disabled ? styles.optionPressed : null,
        disabled ? styles.optionDisabled : null,
      ]}>
      <Text
        style={[
          typography.bodyMedium,
          styles.optionLabel,
          { color: selected ? colors.primaryText : colors.text },
        ]}>
        {label}
      </Text>
      <View style={[styles.radio, selected ? styles.radioSelected : styles.radioIdle]}>
        {selected ? <Ionicons name="checkmark" size={16} color={colors.primaryText} /> : null}
      </View>
    </Pressable>
  );
}

/** Single yes/no screener question — full-width tap targets, auto-advances on select. */
export function QuestionCard({ text, value, onAnswer, disabled = false }: QuestionCardProps) {
  return (
    <View style={styles.container}>
      <Text style={[typography.h2, styles.question, { color: colors.text }]}>{text}</Text>
      <Text style={[typography.caption, styles.hint, { color: colors.textMuted }]}>
        Tap an answer to continue
      </Text>
      <View style={styles.options}>
        <AnswerOption
          label="Yes"
          selected={value === true}
          disabled={disabled}
          onPress={() => onAnswer(true)}
        />
        <AnswerOption
          label="No"
          selected={value === false}
          disabled={disabled}
          onPress={() => onAnswer(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  question: {
    textAlign: 'left',
  },
  hint: {
    marginTop: -spacing.sm,
  },
  options: {
    gap: spacing.md,
  },
  option: {
    minHeight: 64,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionIdle: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionPressed: {
    opacity: 0.92,
  },
  optionDisabled: {
    opacity: 0.55,
  },
  optionLabel: {
    flex: 1,
    paddingRight: spacing.md,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioIdle: {
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  radioSelected: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
