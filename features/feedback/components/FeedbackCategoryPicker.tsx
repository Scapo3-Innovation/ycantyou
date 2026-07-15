import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FEEDBACK_CATEGORIES } from '@/features/feedback/constants';
import { colors, radius, spacing, typography } from '@/theme';
import type { FeedbackKind } from '@/types/database';

type FeedbackCategoryPickerProps = {
  value: FeedbackKind;
  onChange: (kind: FeedbackKind) => void;
};

/** Bug / Feature / Feedback selector — three icon tiles in a row. */
export function FeedbackCategoryPicker({ value, onChange }: FeedbackCategoryPickerProps) {
  return (
    <View style={styles.row}>
      {FEEDBACK_CATEGORIES.map((option) => {
        const selected = option.kind === value;
        return (
          <Pressable
            key={option.kind}
            onPress={() => onChange(option.kind)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={({ pressed }) => [
              styles.tile,
              selected && styles.tileSelected,
              pressed && styles.pressed,
            ]}>
            <Ionicons
              name={option.icon}
              size={22}
              color={selected ? colors.secondary : colors.textMuted}
            />
            <Text
              style={[
                typography.captionMedium,
                { color: selected ? colors.text : colors.textMuted },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 88,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  tileSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.tealTint,
  },
  pressed: {
    opacity: 0.92,
  },
});
