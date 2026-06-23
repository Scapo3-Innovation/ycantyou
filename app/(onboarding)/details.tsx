import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateOfBirthField } from '@/components/ui/DateOfBirthField';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/features/auth/AuthProvider';
import { completeOnboarding } from '@/features/onboarding/api';
import { GOALS, LANGUAGES } from '@/features/onboarding/constants';
import { onboardingDetailsSchema } from '@/features/onboarding/validation';
import { profileQueryKey } from '@/features/profile/useProfile';
import { colors, spacing, typography } from '@/theme';
import type { Goal } from '@/types/database';

type FieldErrors = Partial<Record<'full_name' | 'dob' | 'goal' | 'language', string>>;

export default function DetailsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [language, setLanguage] = useState<string>('en');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!userId) return;
    setSubmitError(undefined);
    const parsed = onboardingDetailsSchema.safeParse({
      full_name: fullName,
      dob,
      goal,
      language,
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
    setSubmitting(true);
    try {
      await completeOnboarding(userId, parsed.data);
      // Flip the routing guard: re-fetch the profile (now onboarding_status='completed').
      await queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
    } catch {
      setSubmitError('Could not save your details. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[typography.title, { color: c.text }]}>About you</Text>
            <Text style={[typography.body, { color: c.textMuted }]}>
              This helps us tailor the app to your goal.
            </Text>
          </View>

          <TextField
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            error={errors.full_name}
            autoCapitalize="words"
            placeholder="Your name"
          />

          <DateOfBirthField
            label="Date of birth"
            value={dob}
            onChange={setDob}
            error={errors.dob}
          />

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

          {submitError ? (
            <Text style={[typography.caption, { color: c.danger }]}>{submitError}</Text>
          ) : null}

          <Button label="Finish" onPress={onSubmit} loading={submitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
});
