import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateOfBirthField } from '@/components/ui/DateOfBirthField';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { TextField } from '@/components/ui/TextField';
import { GOALS, LANGUAGES } from '@/features/onboarding/constants';
import { onboardingDetailsSchema } from '@/features/onboarding/validation';
import { updateProfile } from '@/features/profile/api';
import { profileQueryKey } from '@/features/profile/useProfile';
import { colors, spacing, typography } from '@/theme';
import type { Goal, Profile } from '@/types/database';

type FieldErrors = Partial<Record<'full_name' | 'dob' | 'goal' | 'language', string>>;

/**
 * Editable profile fields. State is seeded once from `profile` via lazy initializers,
 * so there is no effect-driven setState. Remount (via a `key` on the parent) re-seeds.
 */
export function ProfileForm({ userId, profile }: { userId: string; profile: Profile }) {
  const queryClient = useQueryClient();
  const c = colors;

  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [dob, setDob] = useState(profile.dob ?? '');
  const [goal, setGoal] = useState<Goal | null>(profile.goal);
  const [language, setLanguage] = useState<string>(profile.language);
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
    const parsed = onboardingDetailsSchema.safeParse({ full_name: fullName, dob, goal, language });
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
      <OptionGroup
        label="Your main goal"
        options={GOALS}
        value={goal}
        onChange={setGoal}
        error={errors.goal}
      />
      <OptionGroup
        label="Language"
        options={LANGUAGES}
        value={language}
        onChange={setLanguage}
        error={errors.language}
      />

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
});
