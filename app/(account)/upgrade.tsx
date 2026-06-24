import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { startEmailUpgrade, verifyEmailUpgrade } from '@/features/auth/api';
import { emailSchema, otpSchema } from '@/features/auth/validation';
import { colors, spacing, typography } from '@/theme';

type Step = 'email' | 'code';

/**
 * Upgrade an anonymous guest into a permanent account by linking an email.
 *
 * Reuses the same typed 6-digit OTP pattern as sign-in: enter email → receive a code →
 * verify. The user id is unchanged, so the guest's profile, consent, and logged data all
 * carry over. On success the account is no longer anonymous (isGuest flips to false).
 */
export default function UpgradeScreen() {
  const router = useRouter();
  const c = colors;

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function onSendCode() {
    setSubmitError(undefined);
    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message);
      return;
    }
    setFieldError(undefined);
    setSubmitting(true);
    try {
      await startEmailUpgrade(parsed.data.email);
      setEmail(parsed.data.email);
      setStep('code');
    } catch {
      setSubmitError('Could not send the code. This email may already be in use.');
    } finally {
      setSubmitting(false);
    }
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
      await verifyEmailUpgrade(email, parsed.data.token);
      Alert.alert('Account linked', 'Your email is now linked. You can sign in with it next time.');
      router.back();
    } catch {
      setSubmitError('That code is invalid or expired. Request a new one.');
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
            <Text style={[typography.title, { color: c.text }]}>Link an email</Text>
            <Text style={[typography.body, { color: c.textMuted }]}>
              {step === 'email'
                ? 'Add an email to turn your guest session into a permanent account. Your data stays exactly as it is.'
                : `Enter the 6-digit code we sent to ${email}.`}
            </Text>
          </View>

          {step === 'email' ? (
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
              onSubmitEditing={onSendCode}
            />
          ) : (
            <TextField
              label="6-digit code"
              value={token}
              onChangeText={(value) => setToken(value.replace(/\D/g, '').slice(0, 6))}
              error={fieldError}
              keyboardType="number-pad"
              inputMode="numeric"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={6}
              placeholder="123456"
              returnKeyType="done"
              onSubmitEditing={onVerify}
            />
          )}

          {submitError ? (
            <Text style={[typography.caption, { color: c.danger }]}>{submitError}</Text>
          ) : null}

          {step === 'email' ? (
            <Button label="Send code" onPress={onSendCode} loading={submitting} />
          ) : (
            <Button label="Link email" onPress={onVerify} loading={submitting} />
          )}
          <Button label="Cancel" variant="secondary" onPress={() => router.back()} />
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
    gap: spacing.md,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
});
