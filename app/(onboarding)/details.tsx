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
import { PartnerCodeField } from '@/components/ui/PartnerCodeField';
import { SexAtBirthField } from '@/components/ui/SexAtBirthField';
import { TextField } from '@/components/ui/TextField';
import { screenBodyPadding } from '@/components/ui/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  completePartnerOnboarding,
  completePrimaryOnboarding,
} from '@/features/onboarding/api';
import { ageFromDob } from '@/features/onboarding/ageFromDob';
import {
  GOALS,
  GOAL_FOCUS_FOOTNOTE,
  ONBOARDING_PATH_OPTIONS,
} from '@/features/onboarding/constants';
import { onboardingImages } from '@/features/onboarding/images';
import {
  onboardingBasicsSchema,
  onboardingGoalSchema,
  onboardingPartnerCodeSchema,
} from '@/features/onboarding/validation';
import { profileQueryKey } from '@/features/profile/useProfile';
import { analytics } from '@/lib/analytics';
import { colors, radius, spacing, typography } from '@/theme';
import type { Goal, SexAtBirth } from '@/types/database';

type BasicsErrors = Partial<Record<'full_name' | 'dob' | 'sex_assigned_at_birth', string>>;
type Step2Errors = Partial<Record<'goal' | 'partner_code', string>>;

type OnboardingStep = 'basics' | 'path' | 'goal' | 'code';

const GOAL_HERO_HEIGHT = 176;

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

function stepAfterBasics(sex: SexAtBirth): OnboardingStep {
  if (sex === 'male') return 'code';
  if (sex === 'prefer_not_to_say') return 'path';
  return 'goal';
}

export default function DetailsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const c = colors;

  const [step, setStep] = useState<OnboardingStep>('basics');
  const [fullName, setFullName] = useState('');
  const [sexAtBirth, setSexAtBirth] = useState<SexAtBirth | null>(null);
  const [dob, setDob] = useState('');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [partnerCode, setPartnerCode] = useState('');
  const [basicsErrors, setBasicsErrors] = useState<BasicsErrors>({});
  const [step2Errors, setStep2Errors] = useState<Step2Errors>({});
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const age = useMemo(() => ageFromDob(dob), [dob]);
  const greeting = useMemo(() => {
    const name = firstName(fullName);
    return name ? `Nice to meet you, ${name}!` : null;
  }, [fullName]);

  const stepIndex = step === 'basics' ? 0 : 1;
  const isFinishStep = step === 'goal' || step === 'code';

  function onNextFromBasics() {
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
    setStep(stepAfterBasics(parsed.data.sex_assigned_at_birth));
  }

  function onBack() {
    if (step === 'basics') return;
    if (step === 'path') {
      setStep('basics');
      return;
    }
    if (step === 'goal' || step === 'code') {
      if (sexAtBirth === 'prefer_not_to_say') {
        setStep('path');
      } else {
        setStep('basics');
      }
    }
  }

  async function onSubmit(options?: { skipGoal?: boolean }) {
    if (!userId || submitting) return;
    setSubmitError(undefined);

    const basics = onboardingBasicsSchema.safeParse({
      full_name: fullName,
      sex_assigned_at_birth: sexAtBirth,
      dob,
    });
    if (!basics.success) {
      setStep('basics');
      return;
    }

    setSubmitting(true);

    try {
      if (step === 'code') {
        const parsed = onboardingPartnerCodeSchema.safeParse({ partner_code: partnerCode });
        if (!parsed.success) {
          const next: Step2Errors = {};
          for (const issue of parsed.error.issues) {
            const key = issue.path[0] as keyof Step2Errors;
            if (key && !next[key]) next[key] = issue.message;
          }
          setStep2Errors(next);
          setSubmitting(false);
          return;
        }
        setStep2Errors({});
        await completePartnerOnboarding(userId, {
          ...basics.data,
          partner_code: parsed.data.partner_code,
        });
        analytics.track('partner_code_redeemed');
        analytics.track('onboarding_completed', { mode: 'partner' });
      } else {
        let goalValue: Goal | null = null;
        if (options?.skipGoal) {
          setStep2Errors({});
        } else {
          const parsed = onboardingGoalSchema.safeParse({ goal });
          if (!parsed.success) {
            const next: Step2Errors = {};
            for (const issue of parsed.error.issues) {
              const key = issue.path[0] as keyof Step2Errors;
              if (key && !next[key]) next[key] = issue.message;
            }
            setStep2Errors(next);
            setSubmitting(false);
            return;
          }
          goalValue = parsed.data.goal;
        }
        await completePrimaryOnboarding(userId, {
          ...basics.data,
          goal: goalValue,
        });
        if (options?.skipGoal) {
          analytics.track('onboarding_goal_skipped');
        }
        analytics.track('onboarding_completed', {
          mode: 'primary',
          goal_skipped: Boolean(options?.skipGoal),
        });
      }

      await queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : 'Could not save your details. Please try again.',
      );
      setSubmitting(false);
    }
  }

  function onSkipGoal() {
    void onSubmit({ skipGoal: true });
  }

  function onPrimaryAction() {
    if (step === 'basics') {
      onNextFromBasics();
      return;
    }
    if (isFinishStep) {
      void onSubmit();
    }
  }

  function renderSecondStep() {
    if (step === 'path') {
      return (
        <View style={styles.stepBody}>
          <HeroBanner
            image={onboardingImages.goals}
            title="How will you use the app?"
            subtitle="Pick the path that fits you."
            compact
            photoHeight={GOAL_HERO_HEIGHT}
            topInset={insets.top}
            copyBottomInset={0}
          />
          <View style={[styles.goalContent, screenBodyPadding]}>
            <OptionGroup
              label="Your path"
              options={ONBOARDING_PATH_OPTIONS}
              value={null}
              onChange={(value) => setStep(value === 'partner' ? 'code' : 'goal')}
              variant="compact"
              hideLabel
            />
          </View>
        </View>
      );
    }

    if (step === 'code') {
      return (
        <View style={styles.stepBody}>
          <HeroBanner
            image={onboardingImages.basics}
            title="Enter her partner code"
            subtitle="She generates this from the Partner tab and shares it with you."
            compact
            topInset={insets.top}
          />
          <View style={[styles.goalContent, screenBodyPadding]}>
            <PartnerCodeField
              value={partnerCode}
              onChange={setPartnerCode}
              error={step2Errors.partner_code ?? submitError}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.stepBody}>
        <View style={styles.goalHeroWrap}>
          <HeroBanner
            image={onboardingImages.goals}
            title="What's your main goal?"
            subtitle="Pick what we highlight first — change anytime in profile."
            compact
            photoHeight={GOAL_HERO_HEIGHT}
            topInset={insets.top}
            copyBottomInset={spacing.xs}
            copyOverlap={spacing.lg}
          />
          <Pressable
            onPress={onSkipGoal}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting, busy: submitting }}
            hitSlop={8}
            style={[
              styles.skipButton,
              { top: insets.top + spacing.sm },
              submitting && styles.skipButtonDisabled,
            ]}>
            <Text style={styles.skipLabel}>Skip</Text>
          </Pressable>
        </View>
        <View style={[styles.goalContent, styles.goalOptionsContent, screenBodyPadding]}>
          <OptionGroup
            label="Your main goal"
            options={GOALS}
            value={goal}
            onChange={setGoal}
            error={step2Errors.goal}
            variant="compact"
            hideLabel
          />
          <Text style={[typography.caption, styles.goalFootnote, { color: c.textFaint }]}>
            {GOAL_FOCUS_FOOTNOTE}
          </Text>
          {submitError ? (
            <Text style={[typography.caption, { color: c.danger }]}>{submitError}</Text>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.container}>
          {step === 'basics' ? (
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
                    label="Sex"
                    hint="Helps us tailor cycle and health insights."
                    value={sexAtBirth}
                    onChange={setSexAtBirth}
                    error={basicsErrors.sex_assigned_at_birth}
                  />
                  <DateOfBirthField
                    label="Date of birth"
                    value={dob}
                    onChange={setDob}
                    error={basicsErrors.dob}
                    placeholder="Tap to choose date"
                  />
                  {age != null ? (
                    <Text style={[typography.captionMedium, styles.ageLine, { color: c.secondary }]}>
                      You&apos;re {age} years old
                    </Text>
                  ) : null}
                </View>
              </ScrollView>
            </>
          ) : (
            renderSecondStep()
          )}

          <View style={[styles.footer, screenBodyPadding]}>
            <View style={styles.footerLeft}>
              {step !== 'basics' ? (
                <Pressable
                  onPress={onBack}
                  accessibilityRole="button"
                  hitSlop={8}
                  style={styles.backButton}>
                  <Text style={[typography.bodyMedium, { color: c.textMuted }]}>Back</Text>
                </Pressable>
              ) : null}
              <View style={styles.dots}>
                {[0, 1].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === stepIndex ? styles.dotActive : styles.dotInactive,
                      { backgroundColor: i === stepIndex ? c.primary : c.border },
                    ]}
                  />
                ))}
              </View>
            </View>

            {step === 'path' ? (
              <View style={styles.nextButtonPlaceholder} />
            ) : (
              <Pressable
                onPress={onPrimaryAction}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityState={{ disabled: submitting, busy: submitting }}
                style={({ pressed }) => [
                  styles.nextButton,
                  (pressed || submitting) && styles.nextButtonPressed,
                  submitting && styles.nextButtonDisabled,
                ]}>
                <Text style={styles.nextLabel}>
                  {submitting ? 'Saving…' : isFinishStep ? 'Finish' : 'Next'}
                </Text>
              </Pressable>
            )}
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
  stepBody: {
    flex: 1,
  },
  goalHeroWrap: {
    position: 'relative',
    overflow: 'visible',
  },
  skipButton: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  skipButtonDisabled: {
    opacity: 0.6,
  },
  skipLabel: {
    ...typography.bodyMedium,
    color: colors.primaryText,
  },
  basicsScroll: {
    flexGrow: 1,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  form: {
    gap: spacing.xl,
  },
  ageLine: {
    marginTop: -spacing.sm,
  },
  goalContent: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  goalOptionsContent: {
    marginTop: -spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  goalFootnote: {
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
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flex: 1,
  },
  backButton: {
    minHeight: 52,
    justifyContent: 'center',
    paddingRight: spacing.sm,
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
  nextButtonPlaceholder: {
    minWidth: 132,
    minHeight: 52,
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
