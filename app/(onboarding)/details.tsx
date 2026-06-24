import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateOfBirthField } from '@/components/ui/DateOfBirthField';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { SexAtBirthField } from '@/components/ui/SexAtBirthField';
import { TextField } from '@/components/ui/TextField';
import { screenBodyPadding } from '@/components/ui/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { completeOnboarding } from '@/features/onboarding/api';
import { ageFromDob } from '@/features/onboarding/ageFromDob';
import { GOALS, GOAL_FOCUS_FOOTNOTE } from '@/features/onboarding/constants';
import { onboardingImages } from '@/features/onboarding/images';
import {
  onboardingBasicsSchema,
  onboardingGoalSchema,
} from '@/features/onboarding/validation';
import { profileQueryKey } from '@/features/profile/useProfile';
import { analytics } from '@/lib/analytics';
import { colors, radius, spacing, typography } from '@/theme';
import type { Goal, SexAtBirth } from '@/types/database';

type BasicsErrors = Partial<Record<'full_name' | 'dob' | 'sex_assigned_at_birth', string>>;
type GoalErrors = Partial<Record<'goal', string>>;

const STEPS = ['basics', 'goal'] as const;

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

export default function DetailsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const c = colors;

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [sexAtBirth, setSexAtBirth] = useState<SexAtBirth | null>(null);
  const [dob, setDob] = useState('');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [basicsErrors, setBasicsErrors] = useState<BasicsErrors>({});
  const [goalErrors, setGoalErrors] = useState<GoalErrors>({});
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const age = useMemo(() => ageFromDob(dob), [dob]);
  const greeting = useMemo(() => {
    const name = firstName(fullName);
    return name ? `Nice to meet you, ${name}!` : null;
  }, [fullName]);

  const isLastStep = step === STEPS.length - 1;

  function onNext() {
    if (step === 0) {
      const parsed = onboardingBasicsSchema.safeParse({
        full_name: fullName,
        sex_assigned_at_birth: sexAtBirth,
        dob,
      });
      if (!parsed.success) {
        const next: BasicsErrors = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof BasicsErrors;
          if (key && !next[key]) next[key] = issue.message;
        }
        setBasicsErrors(next);
        return;
      }
      setBasicsErrors({});
      setStep(1);
      return;
    }

    void onSubmit();
  }

  function onBack() {
    if (step > 0) setStep(step - 1);
  }

  async function onSubmit() {
    if (!userId) return;
    setSubmitError(undefined);

    const parsed = onboardingGoalSchema.safeParse({ goal });
    if (!parsed.success) {
      const next: GoalErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof GoalErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setGoalErrors(next);
      return;
    }

    const basics = onboardingBasicsSchema.safeParse({
      full_name: fullName,
      sex_assigned_at_birth: sexAtBirth,
      dob,
    });
    if (!basics.success) {
      setStep(0);
      return;
    }

    setGoalErrors({});
    setSubmitting(true);
    try {
      await completeOnboarding(userId, {
        full_name: basics.data.full_name,
        dob: basics.data.dob,
        sex_assigned_at_birth: basics.data.sex_assigned_at_birth,
        goal: parsed.data.goal,
      });
      analytics.track('onboarding_completed');
      await queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
    } catch {
      setSubmitError('Could not save your details. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.container}>
          {step > 0 ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              hitSlop={8}
              style={[styles.backRow, { paddingTop: insets.top + spacing.sm }]}>
              <Text style={[typography.bodyMedium, { color: c.textMuted }]}>Back</Text>
            </Pressable>
          ) : null}

          {step === 0 ? (
            <>
              <HeroBanner
                image={onboardingImages.basics}
                title="Let's get to know you"
                subtitle="A few basics so we can personalize your experience."
                compact
                topInset={insets.top}
              />

              <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.basicsScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <View style={[styles.form, screenBodyPadding]}>
                  {greeting ? (
                    <Text style={[typography.bodyMedium, { color: c.primary }]}>{greeting}</Text>
                  ) : null}

                  <TextField
                    label="Full name"
                    value={fullName}
                    onChangeText={setFullName}
                    error={basicsErrors.full_name}
                    autoCapitalize="words"
                    autoComplete="name"
                    placeholder="Your name"
                    returnKeyType="next"
                  />

                  <SexAtBirthField
                    value={sexAtBirth}
                    onChange={setSexAtBirth}
                    error={basicsErrors.sex_assigned_at_birth}
                  />

                  <View style={styles.dobBlock}>
                    <DateOfBirthField
                      label="Date of birth"
                      value={dob}
                      onChange={setDob}
                      error={basicsErrors.dob}
                    />
                    {age != null ? (
                      <Text style={[typography.bodyMedium, styles.ageLine, { color: c.secondary }]}>
                        You&apos;re {age} years old
                      </Text>
                    ) : null}
                  </View>
                </View>
              </ScrollView>
            </>
          ) : (
            <ScrollView
              style={styles.flex}
              contentContainerStyle={[styles.goalScroll, screenBodyPadding]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
                <Text style={[typography.display, styles.title, { color: c.text }]}>
                  What&apos;s your main goal?
                </Text>
                <Text style={[typography.body, { color: c.textMuted }]}>
                  Pick what we highlight first. You can change this anytime in your profile.
                </Text>
              </View>

              <OptionGroup
                label="Your main goal"
                options={GOALS}
                value={goal}
                onChange={setGoal}
                error={goalErrors.goal}
              />

              <Text style={[typography.caption, styles.goalFootnote, { color: c.textFaint }]}>
                {GOAL_FOCUS_FOOTNOTE}
              </Text>

              {submitError ? (
                <Text style={[typography.caption, { color: c.danger }]}>{submitError}</Text>
              ) : null}
            </ScrollView>
          )}

          <View style={[styles.footer, screenBodyPadding]}>
            <View style={styles.dots}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === step ? styles.dotActive : styles.dotInactive,
                    { backgroundColor: i === step ? c.primary : c.border },
                  ]}
                />
              ))}
            </View>

            <Pressable
              onPress={onNext}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting, busy: submitting }}
              style={({ pressed }) => [
                styles.nextButton,
                (pressed || submitting) && styles.nextButtonPressed,
                submitting && styles.nextButtonDisabled,
              ]}>
              <Text style={styles.nextLabel}>
                {submitting ? 'Saving…' : isLastStep ? 'Finish' : 'Next'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  backRow: {
    paddingHorizontal: spacing.xl,
    minHeight: 40,
    justifyContent: 'center',
  },
  basicsScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  form: {
    gap: spacing.lg,
  },
  dobBlock: {
    gap: spacing.sm,
  },
  ageLine: {
    paddingLeft: spacing.xs,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  goalScroll: {
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  goalFootnote: {
    marginTop: -spacing.sm,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
  },
  dotInactive: {
    width: 8,
  },
  dotActive: {
    width: 28,
  },
  nextButton: {
    minWidth: 132,
    minHeight: 52,
    borderRadius: radius.control,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  nextButtonPressed: {
    opacity: 0.85,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextLabel: {
    ...typography.button,
    color: colors.text,
  },
});
