import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateOfBirthField } from '@/components/ui/DateOfBirthField';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { SexAtBirthField } from '@/components/ui/SexAtBirthField';
import { TextField } from '@/components/ui/TextField';
import { GOALS, GOAL_FOCUS_FOOTNOTE } from '@/features/onboarding/constants';
import { profileDetailsSchema } from '@/features/onboarding/validation';
import { updateProfile } from '@/features/profile/api';
import { profileQueryKey } from '@/features/profile/useProfile';
import { colors, spacing, typography } from '@/theme';
import type { Goal, Profile, SexAtBirth } from '@/types/database';

type FieldErrors = Partial<
  Record<'full_name' | 'dob' | 'sex_assigned_at_birth' | 'goal', string>
>;

/**
 * Editable profile fields. State is seeded once from `profile` via lazy initializers,
 * so there is no effect-driven setState. Remount (via a `key` on the parent) re-seeds.
 */
export function ProfileForm({ userId, profile }: { userId: string; profile: Profile }) {
  const queryClient = useQueryClient();
  const c = colors;

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
    },
  });

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
    <>
      <TextField
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        error={errors.full_name}
        autoCapitalize="words"
      />
      <DateOfBirthField label="Date of birth" value={dob} onChange={setDob} error={errors.dob} />
      <SexAtBirthField
        value={sexAtBirth}
        onChange={setSexAtBirth}
        error={errors.sex_assigned_at_birth}
      />
      <OptionGroup
        label="Your main goal"
        options={GOALS}
        value={goal}
        onChange={setGoal}
        error={errors.goal}
      />
      <Text style={[typography.caption, styles.goalFootnote, { color: c.textFaint }]}>
        {GOAL_FOCUS_FOOTNOTE}
      </Text>

      {mutation.isError ? (
        <Text style={[typography.caption, styles.message, { color: c.danger }]}>
          Could not save changes. Please try again.
        </Text>
      ) : null}
      {saved ? (
        <Text style={[typography.caption, styles.message, { color: c.success }]}>Saved.</Text>
      ) : null}

      <Button label="Save changes" onPress={onSave} loading={mutation.isPending} />
    </>
  );
}

const styles = StyleSheet.create({
  message: {
    marginTop: -spacing.sm,
  },
  goalFootnote: {
    marginTop: -spacing.sm,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
