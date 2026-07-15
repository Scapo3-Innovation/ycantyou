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
  type LayoutChangeEvent,
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
import { radius, spacing } from '@/theme/spacing';

const VERIFY_HERO_HEIGHT = 240;
const VERIFY_HERO_HEIGHT_KEYBOARD = 96;

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email, mode: modeParam } = useLocalSearchParams<{ email: string; mode?: string }>();
  const authMode: EmailAuthMode = modeParam === 'sign-up' ? 'sign-up' : 'sign-in';
  const c = colors;

  const scrollRef = useRef<ScrollView>(null);
  const otpScrollY = useRef(0);

  const [token, setToken] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const { canResend, cooldownLabel, restart: restartResendCooldown } = useOtpResendCooldown();

  const busy = submitting || resending;
  const heroHeight = keyboardOpen ? VERIFY_HERO_HEIGHT_KEYBOARD : VERIFY_HERO_HEIGHT;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  function onFormLayout(event: LayoutChangeEvent) {
    otpScrollY.current = Math.max(
      0,
      heroHeight + insets.top + spacing.lg + event.nativeEvent.layout.y - spacing.xl,
    );
  }

  useEffect(() => {
    if (keyboardOpen) {
      requestAnimationFrame(() => scrollToOtp());
    }
  }, [keyboardOpen, heroHeight, insets.top]);

  function scrollToOtp() {
    scrollRef.current?.scrollTo({ y: otpScrollY.current, animated: true });
  }

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

  return (
    <Screen edgeToEdge>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
        style={[styles.backLink, { top: insets.top + spacing.sm, left: spacing.lg }]}>
        <Text style={[typography.captionMedium, { color: c.primaryText }]}>Back</Text>
      </Pressable>

      <KeyboardAvoidingView
        behavior="padding"
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          <HeroBanner
            image={onboardingImages.screening}
            compact
            photoHeight={heroHeight}
            topInset={insets.top}
          />

          <View style={[styles.content, screenBodyPadding]}>
            <View style={styles.header}>
              <Text style={[typography.h1, { color: c.text }]}>
                {authMode === 'sign-up' ? 'Verify your email' : 'Check your inbox'}
              </Text>
              <Text style={[typography.body, styles.subtitle, { color: c.textMuted }]}>
                {authMode === 'sign-up'
                  ? 'Enter the code we sent to create your account: '
                  : 'Enter the code we sent to sign in: '}
                <Text style={{ color: c.text }}>{email}</Text>.
              </Text>
            </View>

            <View style={styles.form} onLayout={onFormLayout}>
              <OtpCodeField
                value={token}
                onChangeText={setToken}
                error={fieldError}
                autoFocus
                onFocus={scrollToOtp}
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
                label={authMode === 'sign-up' ? 'Create account' : 'Verify'}
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
  backLink: {
    position: 'absolute',
    zIndex: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  content: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  subtitle: {
    lineHeight: 22,
  },
  form: {
    gap: spacing.lg,
  },
  cooldown: {
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
