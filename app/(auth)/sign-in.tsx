import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { PrivacyNote } from '@/components/ui/PrivacyNote';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { sendEmailOtp, signInAsGuest } from '@/features/auth/api';
import { emailSchema } from '@/features/auth/validation';
import { PRIVACY_POLICY_URL } from '@/features/onboarding/constants';
import { colors, spacing, typography } from '@/theme';

// DEV/testing only — gates the "Continue as guest" button. Auto-hidden in production
// builds (`__DEV__` is false there); flip/remove this before launch. See signInAsGuest().
const SHOW_GUEST_SIGN_IN = __DEV__;

export default function SignInScreen() {
  const router = useRouter();
  const c = colors;

  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  // DEV/testing only — sign in anonymously. The auth listener then redirects into
  // onboarding automatically, so the guest is treated like any signed-in user.
  async function onContinueAsGuest() {
    setSubmitError(undefined);
    setGuestLoading(true);
    try {
      await signInAsGuest();
    } catch {
      setSubmitError('Could not start a guest session. Try again.');
      setGuestLoading(false);
    }
  }

  async function onSubmit() {
    setSubmitError(undefined);
    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message);
      return;
    }
    setFieldError(undefined);
    setSubmitting(true);
    try {
      await sendEmailOtp(parsed.data.email);
      router.push({ pathname: '/(auth)/verify', params: { email: parsed.data.email } });
    } catch {
      setSubmitError('Could not send the code. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[typography.title, { color: c.text }]}>Sign in</Text>
            <Text style={[typography.body, { color: c.textMuted }]}>
              Enter your email and we&apos;ll send you a 6-digit code.
            </Text>
          </View>

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={fieldError}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            inputMode="email"
            autoCorrect={false}
            placeholder="you@example.com"
            returnKeyType="send"
            onSubmitEditing={onSubmit}
          />

          {submitError ? (
            <Text style={[typography.caption, { color: c.danger }]}>{submitError}</Text>
          ) : null}

          <Button label="Send code" onPress={onSubmit} loading={submitting} />

          {/* DEV/testing only — remove before launch (gated by SHOW_GUEST_SIGN_IN). */}
          {SHOW_GUEST_SIGN_IN ? (
            <Button
              label="Continue as guest"
              variant="secondary"
              onPress={onContinueAsGuest}
              loading={guestLoading}
            />
          ) : null}

          <PrivacyNote onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
});
