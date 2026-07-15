import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { GOAL_FOCUS_FOOTNOTE } from '@/features/onboarding/constants';
import { profileDetailsSchema } from '@/features/onboarding/validation';
import { ProfileDetailsCard } from '@/features/profile/components/ProfileDetailsCard';
import { updateProfile } from '@/features/profile/api';
import { profileQueryKey } from '@/features/profile/useProfile';
import { colors, spacing, typography } from '@/theme';
import type { Goal, Profile, SexAtBirth } from '@/types/database';

type FieldErrors = Partial<
  Record<'full_name' | 'dob' | 'sex_assigned_at_birth' | 'goal', string>
>;

/** Profile details — read-only by default; edit mode shows fields and save. */
export function ProfileForm({ userId, profile }: { userId: string; profile: Profile }) {
  const queryClient = useQueryClient();
  const c = colors;

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [dob, setDob] = useState(profile.dob ?? '');
  const [sexAtBirth, setSexAtBirth] = useState<SexAtBirth | null>(profile.sex_assigned_at_birth);
  const [goal, setGoal] = useState<Goal | null>(profile.goal);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: (patch: Parameters<typeof updateProfile>[1]) => updateProfile(userId, patch),
    onSuccess: (updated: Profile) => {
      queryClient.setQueryData(profileQueryKey(userId), updated);
      setSaved(true);
      setIsEditing(false);
    },
  });

  function resetFields() {
    setFullName(profile.full_name ?? '');
    setDob(profile.dob ?? '');
    setSexAtBirth(profile.sex_assigned_at_birth);
    setGoal(profile.goal);
    setErrors({});
    setSaved(false);
  }

  function onEdit() {
    resetFields();
    setIsEditing(true);
  }

  function onCancel() {
    resetFields();
    setIsEditing(false);
  }

  function onSave() {
    setSaved(false);
    const parsed = profileDetailsSchema.safeParse({
      full_name: fullName,
      dob,
      sex_assigned_at_birth: sexAtBirth,
      goal,
    });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  }

  return (
    <View style={styles.wrap}>
      <ProfileDetailsCard
        editing={isEditing}
        onEdit={onEdit}
        fullName={fullName}
        dob={dob}
        sexAtBirth={sexAtBirth}
        goal={goal}
        onChangeName={setFullName}
        onChangeDob={setDob}
        onChangeSex={setSexAtBirth}
        onChangeGoal={setGoal}
        errors={errors}
      />

      {isEditing ? (
        <>
          <Text style={[typography.caption, styles.goalFootnote, { color: c.textFaint }]}>
            {GOAL_FOCUS_FOOTNOTE}
          </Text>

          {mutation.isError ? (
            <Text style={[typography.caption, { color: c.danger }]}>
              Could not save changes. Please try again.
            </Text>
          ) : null}
          {saved ? (
            <Text style={[typography.caption, { color: c.success }]}>Saved.</Text>
          ) : null}

          <Button label="Save changes" onPress={onSave} loading={mutation.isPending} />
          <Button label="Cancel" variant="secondary" onPress={onCancel} disabled={mutation.isPending} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  goalFootnote: {
    fontStyle: 'italic',
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
    marginTop: -spacing.xs,
  },
});
