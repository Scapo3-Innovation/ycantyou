import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Divider } from '@/components/ui/Divider';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';
import { GuestSignInButton } from '@/components/ui/GuestSignInButton';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import {
  sendEmailOtp,
  signInAsGuest,
  signInWithGoogle,
  signUpWithPassword,
  type EmailAuthMode,
} from '@/features/auth/api';
import {
  getOAuthRedirectUri,
  isSupabaseRedirectConfigError,
} from '@/features/auth/oauthRedirect';
import { emailSchema, signUpSchema } from '@/features/auth/validation';
import { onboardingImages } from '@/features/onboarding/images';
import { colors, typography } from '@/theme';
import { radius, spacing } from '@/theme/spacing';

const SHOW_GUEST_SIGN_IN = __DEV__;
/** Temporarily off until Supabase Google OAuth redirect is configured (tunnel/dev build). */
const SHOW_GOOGLE_SIGN_IN = false;
const SHOW_CREATE_ACCOUNT = true;
const AUTH_HERO_HEIGHT = 240;
const AUTH_HERO_HEIGHT_KEYBOARD = 96;

function isUnknownAccountError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = 'message' in error && typeof error.message === 'string' ? error.message : '';
  return /user not found|signups not allowed|invalid login credentials/i.test(message);
}

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors;

  const scrollRef = useRef<ScrollView>(null);
  const emailScrollY = useRef(0);

  const [authMode, setAuthMode] = useState<EmailAuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const busy = submitting || googleLoading || guestLoading;
  const isSignUp = SHOW_CREATE_ACCOUNT && authMode === 'sign-up';
  const heroHeight = keyboardOpen ? AUTH_HERO_HEIGHT_KEYBOARD : AUTH_HERO_HEIGHT;

  const copy = useMemo(
    () =>
      isSignUp
        ? {
            title: 'Create account',
            subtitle: 'Enter your email and password. We’ll send a code to verify your email.',
            cta: 'Create account',
            switchPrompt: 'Already have an account?',
            switchAction: 'Sign in here',
          }
        : {
            title: 'Sign in',
            subtitle: 'Enter your email — we’ll send you a 6-digit code.',
            cta: 'Send code',
            switchPrompt: 'Don’t have an account?',
            switchAction: 'Create one here',
          },
    [isSignUp],
  );

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

  function onEmailSectionLayout(event: LayoutChangeEvent) {
    emailScrollY.current = Math.max(
      0,
      heroHeight + insets.top + spacing.lg + event.nativeEvent.layout.y - spacing.xl,
    );
  }

  useEffect(() => {
    if (keyboardOpen) {
      requestAnimationFrame(() => scrollToEmail());
    }
  }, [keyboardOpen, heroHeight, insets.top]);

  function scrollToEmail() {
    scrollRef.current?.scrollTo({ y: emailScrollY.current, animated: true });
  }

  function switchAuthMode() {
    if (!SHOW_CREATE_ACCOUNT) return;
    setAuthMode(isSignUp ? 'sign-in' : 'sign-up');
    setSubmitError(undefined);
    setEmailError(undefined);
    setPasswordError(undefined);
    setPassword('');
  }

  async function onGoogleSignIn() {
    setSubmitError(undefined);
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result === 'cancelled') return;
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (isSupabaseRedirectConfigError(message) || message.includes('redirect URL')) {
        setSubmitError(
          `Supabase redirect not configured. Add this URL in Supabase → Auth → URL Configuration → Redirect URLs: ${getOAuthRedirectUri()}`,
        );
      } else if (__DEV__ && message) {
        setSubmitError(message);
      } else {
        setSubmitError('Could not sign in with Google. Try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onContinueAsGuest() {
    setSubmitError(undefined);
    setGuestLoading(true);
    try {
      await signInAsGuest();
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setSubmitError(
        message.includes('Supabase') || message.includes('session')
          ? message
          : 'Could not start a guest session. Try again.',
      );
    } finally {
      setGuestLoading(false);
    }
  }

  async function onSubmit() {
    setSubmitError(undefined);
    setEmailError(undefined);
    setPasswordError(undefined);

    if (isSignUp) {
      const parsed = signUpSchema.safeParse({ email, password });
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          if (issue.path[0] === 'password') {
            setPasswordError(issue.message);
          } else {
            setEmailError(issue.message);
          }
        }
        return;
      }

      setSubmitting(true);
      try {
        const result = await signUpWithPassword(parsed.data.email, parsed.data.password);
        if (result === 'verify') {
          router.push({
            pathname: '/(auth)/verify',
            params: { email: parsed.data.email, mode: 'sign-up' },
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (/already registered|already exists|user already/i.test(message)) {
          setSubmitError('This email already has an account. Sign in instead.');
        } else if (/password/i.test(message)) {
          setPasswordError('Choose a stronger password (at least 8 characters).');
        } else {
          setSubmitError('Could not create your account. Check your connection and try again.');
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message);
      return;
    }

    setSubmitting(true);
    try {
      await sendEmailOtp(parsed.data.email, 'sign-in');
      router.push({
        pathname: '/(auth)/verify',
        params: { email: parsed.data.email, mode: 'sign-in' },
      });
    } catch (error) {
      if (isUnknownAccountError(error)) {
        setSubmitError('No account found for this email. Create one below.');
      } else {
        setSubmitError('Could not send the code. Check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen edgeToEdge>
      <Pressable
        onPress={() => router.push('/(auth)/welcome?replay=1')}
        accessibilityRole="button"
        accessibilityLabel="See how the app works"
        hitSlop={12}
        style={[styles.introLink, { top: insets.top + spacing.sm, right: spacing.lg }]}>
        <Text style={[typography.captionMedium, { color: c.primaryText }]}>How it works</Text>
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
            image={onboardingImages.cycle}
            compact
            photoHeight={heroHeight}
            topInset={insets.top}
          />

          <View style={[styles.content, screenBodyPadding]}>
            <View style={styles.header}>
              <Text style={[typography.h1, { color: c.text }]}>{copy.title}</Text>
              <Text style={[typography.body, styles.subtitle, { color: c.textMuted }]}>
                {copy.subtitle}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.emailSection} onLayout={onEmailSectionLayout}>
                <TextField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  error={emailError}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  inputMode="email"
                  autoCorrect={false}
                  placeholder="you@example.com"
                  returnKeyType={isSignUp ? 'next' : 'send'}
                  onFocus={scrollToEmail}
                  onSubmitEditing={isSignUp ? undefined : onSubmit}
                />

                {isSignUp ? (
                  <TextField
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    error={passwordError}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    secureTextEntry
                    textContentType="newPassword"
                    placeholder="At least 8 characters"
                    returnKeyType="send"
                    onFocus={scrollToEmail}
                    onSubmitEditing={onSubmit}
                  />
                ) : null}

                {submitError ? (
                  <Text style={[typography.caption, { color: c.danger }]}>{submitError}</Text>
                ) : null}

                <Button
                  label={copy.cta}
                  onPress={onSubmit}
                  loading={submitting}
                  disabled={busy && !submitting}
                />

                {SHOW_CREATE_ACCOUNT ? (
                  <Pressable
                    onPress={switchAuthMode}
                    accessibilityRole="button"
                    accessibilityLabel={`${copy.switchPrompt} ${copy.switchAction}`}
                    hitSlop={8}
                    style={styles.switchRow}>
                    <Text style={[typography.caption, { color: c.textMuted }]}>
                      {copy.switchPrompt}{' '}
                      <Text style={[typography.captionMedium, { color: c.primary }]}>
                        {copy.switchAction}
                      </Text>
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {!keyboardOpen && (SHOW_GOOGLE_SIGN_IN || SHOW_GUEST_SIGN_IN) ? (
                <>
                  <View style={styles.orRow}>
                    <Divider style={styles.orLine} />
                    <Text style={[typography.caption, { color: c.textFaint }]}>or</Text>
                    <Divider style={styles.orLine} />
                  </View>

                  <View style={styles.socialRow}>
                    {SHOW_GOOGLE_SIGN_IN ? (
                      <GoogleSignInButton
                        variant="icon"
                        onPress={onGoogleSignIn}
                        loading={googleLoading}
                        disabled={busy && !googleLoading}
                      />
                    ) : null}
                    {SHOW_GUEST_SIGN_IN ? (
                      <GuestSignInButton
                        variant="full"
                        onPress={onContinueAsGuest}
                        loading={guestLoading}
                        disabled={busy && !guestLoading}
                      />
                    ) : null}
                  </View>
                </>
              ) : null}
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
  introLink: {
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
  emailSection: {
    gap: spacing.lg,
  },
  switchRow: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    alignSelf: 'stretch',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  orLine: {
    flex: 1,
  },
});
