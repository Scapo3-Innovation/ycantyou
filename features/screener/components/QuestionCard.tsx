import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type QuestionCardProps = {
  text: string;
  value: boolean | null;
  onAnswer: (value: boolean) => void;
};

/** A single yes/no screener question. */
export function QuestionCard({ text, value, onAnswer }: QuestionCardProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  const option = (label: string, optionValue: boolean) => {
    const selected = value === optionValue;
    return (
      <Pressable
        onPress={() => onAnswer(optionValue)}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        style={[
          styles.option,
          {
            backgroundColor: selected ? c.primary : c.surface,
            borderColor: selected ? c.primary : c.border,
          },
        ]}>
        <Text style={[typography.body, { color: selected ? c.primaryText : c.text, fontWeight: '600' }]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.heading, { color: c.text }]}>{text}</Text>
      <View style={styles.options}>
        {option('Yes', true)}
        {option('No', false)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  option: {
    flex: 1,
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
