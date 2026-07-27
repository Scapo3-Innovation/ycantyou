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
import { PasswordRequirements } from '@/components/ui/PasswordRequirements';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import {
  signInAsGuest,
  signInWithGoogle,
  signInWithPassword,
  startSignUpWithPassword,
} from '@/features/auth/api';
import {
  getOAuthRedirectUri,
  isSupabaseRedirectConfigError,
  logOAuthRedirectSetup,
  requiresTunnelForExpoGo,
} from '@/features/auth/oauthRedirect';
import { mapSignInError, mapSignUpError } from '@/features/auth/authErrors';
import { signInSchema, signUpSchema } from '@/features/auth/validation';
import { isPasswordValid } from '@/features/auth/passwordRules';
import { onboardingImages } from '@/features/onboarding/images';
import { colors, typography } from '@/theme';
import { radius, spacing } from '@/theme/spacing';

const SHOW_GUEST_SIGN_IN = __DEV__;
/** Re-enable when Google OAuth is configured for production. */
const SHOW_GOOGLE_SIGN_IN = false;
const SHOW_CREATE_ACCOUNT = true;
const AUTH_HERO_HEIGHT = 200;
const AUTH_HERO_HEIGHT_KEYBOARD = 80;

type ScreenAuthMode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors;

  const scrollRef = useRef<ScrollView>(null);
  const emailScrollY = useRef(0);

  const [authMode, setAuthMode] = useState<ScreenAuthMode>('sign-in');
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
  const passwordReady = isPasswordValid(password);
  const heroHeight = keyboardOpen ? AUTH_HERO_HEIGHT_KEYBOARD : AUTH_HERO_HEIGHT;

  const copy = useMemo(
    () =>
      isSignUp
        ? {
            title: 'Create account',
            subtitle: 'Email, password, then a quick code',
            cta: 'Create account',
            switchPrompt: 'Already have an account?',
            switchAction: 'Sign in here',
          }
        : {
            title: 'Sign in',
            subtitle: 'Email and password',
            cta: 'Sign in',
            switchPrompt: 'Don’t have an account?',
            switchAction: 'Create one here',
          },
    [isSignUp],
  );

  useEffect(() => {
    if (__DEV__ && SHOW_GOOGLE_SIGN_IN) {
      logOAuthRedirectSetup(getOAuthRedirectUri());
    }
  }, []);

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
      if (requiresTunnelForExpoGo()) {
        setSubmitError(
          'Google sign-in needs Expo tunnel mode. Run: npx expo start --tunnel --clear, add the https URL to Supabase Redirect URLs, set EXPO_PUBLIC_OAUTH_REDIRECT_URI in .env, then restart.',
        );
      } else if (isSupabaseRedirectConfigError(message) || message.includes('redirect URL')) {
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
        await startSignUpWithPassword(parsed.data.email, parsed.data.password);
        router.push({
          pathname: '/(auth)/verify',
          params: { email: parsed.data.email, mode: 'sign-up' },
        });
      } catch (error) {
        setSubmitError(mapSignUpError(error));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const parsed = signInSchema.safeParse({ email, password });
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
      await signInWithPassword(parsed.data.email, parsed.data.password);
    } catch (error) {
      setSubmitError(mapSignInError(error));
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
              <Text style={[typography.h2, { color: c.text }]}>{copy.title}</Text>
              <Text style={[typography.caption, { color: c.textMuted }]}>{copy.subtitle}</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fields} onLayout={onEmailSectionLayout}>
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
                  returnKeyType="next"
                  onFocus={scrollToEmail}
                />

                <TextField
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError(undefined);
                  }}
                  error={passwordError}
                  autoCapitalize="none"
                  autoComplete={isSignUp ? 'new-password' : 'password'}
                  secureTextEntry
                  textContentType={isSignUp ? 'newPassword' : 'password'}
                  placeholder={isSignUp ? 'Letters and numbers' : 'Your password'}
                  returnKeyType="send"
                  onFocus={scrollToEmail}
                  onSubmitEditing={onSubmit}
                />

                {isSignUp ? <PasswordRequirements password={password} /> : null}

                {SHOW_CREATE_ACCOUNT && !isSignUp ? (
                  <View style={styles.auxRow}>
                    <Pressable
                      onPress={() => router.push('/(auth)/forgot-password')}
                      accessibilityRole="button"
                      accessibilityLabel="Forgot password"
                      hitSlop={8}>
                      <Text style={[typography.caption, { color: c.primary }]}>
                        Forgot password?
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={switchAuthMode}
                      accessibilityRole="button"
                      accessibilityLabel="Create a new account"
                      hitSlop={8}>
                      <Text style={[typography.captionMedium, { color: c.primary }]}>
                        Create account
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                {submitError ? (
                  <Text style={[typography.caption, { color: c.danger }]}>{submitError}</Text>
                ) : null}

                <Button
                  label={copy.cta}
                  onPress={onSubmit}
                  loading={submitting}
                  disabled={(busy && !submitting) || (isSignUp && !passwordReady) || (!isSignUp && !password)}
                />

                {SHOW_CREATE_ACCOUNT && isSignUp ? (
                  <Pressable
                    onPress={switchAuthMode}
                    accessibilityRole="button"
                    accessibilityLabel="Sign in to an existing account"
                    hitSlop={8}
                    style={styles.switchRow}>
                    <Text style={[typography.caption, { color: c.textMuted }]}>
                      Already have an account?{' '}
                      <Text style={[typography.captionMedium, { color: c.primary }]}>
                        Sign in here
                      </Text>
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {!keyboardOpen && (SHOW_GOOGLE_SIGN_IN || SHOW_GUEST_SIGN_IN) ? (
                <View style={styles.altSection}>
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
                        variant="icon"
                        onPress={onContinueAsGuest}
                        loading={guestLoading}
                        disabled={busy && !guestLoading}
                      />
                    ) : null}
                  </View>
                </View>
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
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  fields: {
    gap: spacing.md,
  },
  switchRow: {
    alignSelf: 'center',
    paddingTop: spacing.xs,
  },
  auxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  altSection: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
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
