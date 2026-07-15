import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { PremiumSection } from '@/components/ui/PremiumSection';
import { GOALS } from '@/features/onboarding/constants';
import { colors, radius, spacing, typography } from '@/theme';
import type { Goal } from '@/types/database';

type ProfileGoalsSectionProps = {
  value: Goal | null;
  onChange: (goal: Goal) => void;
  error?: string;
};

/** Main goal picker — premium card row. */
export function ProfileGoalsSection({ value, onChange, error }: ProfileGoalsSectionProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => GOALS.find((option) => option.value === value), [value]);

  function onSelect(goal: Goal) {
    onChange(goal);
    setOpen(false);
  }

  return (
    <PremiumSection label="Your main goal">
      <Card style={styles.card}>
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Select your main goal"
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <View style={styles.iconTile}>
            <Ionicons name="flag-outline" size={18} color={colors.text} />
          </View>
          <View style={styles.copy}>
            <Text style={[typography.bodyMedium, { color: selected ? colors.text : colors.textMuted }]}>
              {selected?.label ?? 'Select a goal'}
            </Text>
            {selected ? (
              <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={2}>
                {selected.description}
              </Text>
            ) : (
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                What should we highlight first?
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
        </Pressable>
      </Card>

      {error ? (
        <Text style={[typography.caption, styles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>Your main goal</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8} accessibilityRole="button">
                <Text style={[typography.bodyMedium, { color: colors.primary }]}>Done</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.options} bounces={false}>
              {GOALS.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => onSelect(option.value)}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.pressed,
                    ]}>
                    <View style={styles.optionCopy}>
                      <Text style={[typography.bodyMedium, { color: colors.text }]}>{option.label}</Text>
                      <Text style={[typography.caption, { color: colors.textMuted }]}>
                        {option.description}
                      </Text>
                    </View>
                    {isSelected ? (
                      <Ionicons name="checkmark" size={20} color={colors.secondary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </PremiumSection>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  error: {
    paddingHorizontal: spacing.xs,
    marginTop: -spacing.xs,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  options: {
    paddingBottom: spacing.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.tealTint,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.92,
  },
});
