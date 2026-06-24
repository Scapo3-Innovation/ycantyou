import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { sendEmailOtp, verifyEmailOtp } from '@/features/auth/api';
import { otpSchema } from '@/features/auth/validation';
import { colors, spacing, typography } from '@/theme';

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const c = colors;

  const [token, setToken] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

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
      // On success, the session is persisted and the auth listener redirects us out of (auth).
      await verifyEmailOtp(email, parsed.data.token);
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
      await sendEmailOtp(email);
      setResent(true);
    } catch {
      setSubmitError('Could not resend the code. Try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[typography.title, { color: c.text }]}>Enter code</Text>
            <Text style={[typography.body, { color: c.textMuted }]}>
              We sent a 6-digit code to {email}.
            </Text>
          </View>

          <TextField
            label="6-digit code"
            value={token}
            onChangeText={(value) => setToken(value.replace(/\D/g, '').slice(0, 6))}
            error={fieldError}
            keyboardType="number-pad"
            inputMode="numeric"
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            maxLength={6}
            placeholder="123456"
            returnKeyType="done"
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

          <Button label="Verify" onPress={onVerify} loading={submitting} />
          <Button label="Resend code" variant="secondary" onPress={onResend} loading={resending} />
          <Button label="Use a different email" variant="secondary" onPress={() => router.back()} />
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
