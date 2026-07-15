import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { OtpCodeField } from '@/components/ui/OtpCodeField';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { resendEmailOtp, verifyEmailOtp, type EmailAuthMode } from '@/features/auth/api';
import { useOtpResendCooldown } from '@/features/auth/useOtpResendCooldown';
import { otpSchema } from '@/features/auth/validation';
import { onboardingImages } from '@/features/onboarding/images';
import { colors, typography } from '@/theme';
import { spacing } from '@/theme/spacing';

const VERIFY_HERO_HEIGHT = 160;
const BACK_BUTTON_HEIGHT = 40;

function parseAuthMode(modeParam?: string): EmailAuthMode {
  if (modeParam === 'recovery') return 'recovery';
  return 'sign-up';
}

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email, mode: modeParam } = useLocalSearchParams<{ email: string; mode?: string }>();
  const authMode = parseAuthMode(modeParam);
  const c = colors;

  const scrollRef = useRef<ScrollView>(null);

  const [token, setToken] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { canResend, cooldownLabel, restart: restartResendCooldown } = useOtpResendCooldown();

  const busy = submitting || resending;

  const copy =
    authMode === 'recovery'
      ? {
          title: 'Reset your password',
          body: 'Enter the reset code we sent to ',
          cta: 'Continue',
        }
      : {
          title: 'Verify your email',
          body: 'Enter the code we sent to ',
          cta: 'Create account',
        };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardOpen(true);
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardOpen(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  async function onVerify() {
    setSubmitError(undefined);
    const parsed = otpSchema.safeParse({ token });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message);
      return;
    }
    setFieldError(undefined);
    setSubmitting(true);
    try {
      await verifyEmailOtp(email, parsed.data.token, authMode);
      if (authMode === 'recovery') {
        router.replace('/(auth)/reset-password');
      }
    } catch {
      setSubmitError('That code is invalid or expired. Request a new one.');
      setSubmitting(false);
    }
  }

  async function onResend() {
    if (!email) return;
    setSubmitError(undefined);
    setResent(false);
    setResending(true);
    try {
      await resendEmailOtp(email, authMode);
      setResent(true);
      restartResendCooldown();
    } catch {
      setSubmitError('Could not resend the code. Try again.');
    } finally {
      setResending(false);
    }
  }

  const scrollBottomInset = keyboardOpen
    ? keyboardHeight + spacing.lg
    : insets.bottom + spacing.xxl;

  return (
    <Screen edgeToEdge>
      <View style={[styles.toolbar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={styles.backButton}>
          <Text style={[typography.bodyMedium, { color: c.primary }]}>← Back</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + BACK_BUTTON_HEIGHT : 0}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[styles.scroll, { paddingBottom: scrollBottomInset }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          {!keyboardOpen ? (
            <HeroBanner
              image={onboardingImages.screening}
              compact
              photoHeight={VERIFY_HERO_HEIGHT}
              topInset={0}
            />
          ) : null}

          <View style={[styles.content, screenBodyPadding]}>
            <View style={styles.header}>
              <Text style={[typography.h2, { color: c.text }]}>{copy.title}</Text>
              <Text style={[typography.caption, styles.body, { color: c.textMuted }]}>
                {copy.body}
                <Text style={{ color: c.text }}>{email}</Text>.
              </Text>
            </View>

            <View style={styles.form}>
              <OtpCodeField
                value={token}
                onChangeText={setToken}
                error={fieldError}
                autoFocus
                onSubmitEditing={onVerify}
              />

              {submitError ? (
                <Text style={[typography.caption, { color: c.danger }]}>{submitError}</Text>
              ) : null}
              {resent ? (
                <Text style={[typography.caption, { color: c.success }]}>
                  A new code is on its way.
                </Text>
              ) : null}

              <Button
                label={copy.cta}
                onPress={onVerify}
                loading={submitting}
                disabled={busy && !submitting}
              />
              {canResend ? (
                <Button
                  label="Resend code"
                  variant="secondary"
                  onPress={onResend}
                  loading={resending}
                  disabled={busy && !resending}
                />
              ) : (
                <Text style={[typography.caption, styles.cooldown, { color: c.textMuted }]}>
                  Resend code in {cooldownLabel}
                </Text>
              )}
              <Button
                label="Use a different email"
                variant="ghost"
                onPress={() => router.back()}
                disabled={busy}
              />
            </View>
          </View>
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
    flexGrow: 1,
  },
  toolbar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    backgroundColor: colors.background,
    zIndex: 2,
  },
  backButton: {
    minHeight: BACK_BUTTON_HEIGHT,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingRight: spacing.md,
  },
  content: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  body: {
    lineHeight: 18,
  },
  form: {
    gap: spacing.md,
  },
  cooldown: {
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
