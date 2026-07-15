import { Ionicons } from '@expo/vector-icons';
import { format, isValid, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { DateOfBirthField } from '@/components/ui/DateOfBirthField';
import { SexAtBirthField } from '@/components/ui/SexAtBirthField';
import { TextField } from '@/components/ui/TextField';
import { GOALS, SEX_AT_BIRTH_OPTIONS } from '@/features/onboarding/constants';
import { colors, radius, spacing, typography } from '@/theme';
import type { Goal, SexAtBirth } from '@/types/database';

type ProfileDetailsCardProps = {
  editing: boolean;
  onEdit?: () => void;
  fullName: string;
  dob: string;
  sexAtBirth: SexAtBirth | null;
  goal: Goal | null;
  onChangeName: (value: string) => void;
  onChangeDob: (value: string) => void;
  onChangeSex: (value: SexAtBirth) => void;
  onChangeGoal: (goal: Goal) => void;
  errors?: Partial<Record<'full_name' | 'dob' | 'sex_assigned_at_birth' | 'goal', string>>;
};

function formatDobDisplay(value: string): string | null {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? format(parsed, 'd MMMM yyyy') : null;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[typography.captionMedium, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[typography.bodyMedium, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

/** Personal details — read-only by default; editable fields when editing. */
export function ProfileDetailsCard({
  editing,
  onEdit,
  fullName,
  dob,
  sexAtBirth,
  goal,
  onChangeName,
  onChangeDob,
  onChangeSex,
  onChangeGoal,
  errors = {},
}: ProfileDetailsCardProps) {
  const [goalOpen, setGoalOpen] = useState(false);
  const selectedGoal = useMemo(() => GOALS.find((option) => option.value === goal), [goal]);
  const sexLabel = useMemo(
    () => SEX_AT_BIRTH_OPTIONS.find((option) => option.value === sexAtBirth)?.label,
    [sexAtBirth],
  );
  const dobLabel = formatDobDisplay(dob);

  if (!editing) {
    return (
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>Personal details</Text>
          {onEdit ? (
            <Pressable
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel="Edit personal details"
              style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}>
              <Ionicons name="create-outline" size={14} color={colors.primary} />
              <Text style={[typography.captionMedium, { color: colors.primary }]}>Edit</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <DetailRow label="Full name" value={fullName.trim() || 'Not set'} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <DetailRow label="Date of birth" value={dobLabel ?? 'Not set'} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <DetailRow label="Sex" value={sexLabel ?? 'Not set'} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <DetailRow label="Main goal" value={selectedGoal?.label ?? 'Not set'} />
      </Card>
    );
  }

  return (
    <>
      <Card style={styles.card}>
        <Text style={[typography.bodyMedium, { color: colors.text }]}>Personal details</Text>

        <View style={styles.field}>
          <TextField
            label="Full name"
            value={fullName}
            onChangeText={onChangeName}
            autoCapitalize="words"
            error={errors.full_name}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.field}>
          <DateOfBirthField
            label="Date of birth"
            value={dob}
            onChange={onChangeDob}
            error={errors.dob}
            variant="profileRow"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.field}>
          <SexAtBirthField
            label="Sex"
            value={sexAtBirth}
            onChange={onChangeSex}
            error={errors.sex_assigned_at_birth}
            accent="secondary"
            size="compact"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Pressable
          onPress={() => setGoalOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Select your main goal"
          style={({ pressed }) => [styles.goalRow, pressed && styles.pressed]}>
          <View style={styles.goalCopy}>
            <Text style={[typography.captionMedium, { color: colors.textMuted }]}>Main goal</Text>
            <Text style={[typography.bodyMedium, { color: selectedGoal ? colors.text : colors.textMuted }]}>
              {selectedGoal?.label ?? 'Select a goal'}
            </Text>
            {selectedGoal ? (
              <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={2}>
                {selectedGoal.description}
              </Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
        </Pressable>

        {errors.goal ? (
          <Text style={[typography.caption, { color: colors.danger }]} accessibilityLiveRegion="polite">
            {errors.goal}
          </Text>
        ) : null}
      </Card>

      <Modal visible={goalOpen} transparent animationType="slide" onRequestClose={() => setGoalOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setGoalOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>Main goal</Text>
              <Pressable onPress={() => setGoalOpen(false)} hitSlop={8} accessibilityRole="button">
                <Text style={[typography.bodyMedium, { color: colors.primary }]}>Done</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.options} bounces={false}>
              {GOALS.map((option) => {
                const isSelected = option.value === goal;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChangeGoal(option.value);
                      setGoalOpen(false);
                    }}
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
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 11,
    paddingVertical: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.roseTint,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  detailRow: {
    gap: spacing.xs,
  },
  field: {
    gap: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  goalCopy: {
    flex: 1,
    gap: spacing.xs,
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
