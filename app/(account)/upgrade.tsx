import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { useAppDialog } from '@/components/ui/AppDialogProvider';
import { Card } from '@/components/ui/Card';
import { FormSection } from '@/components/ui/FormSection';
import { OtpCodeField } from '@/components/ui/OtpCodeField';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { startEmailUpgrade, verifyEmailUpgrade } from '@/features/auth/api';
import { emailSchema, otpSchema } from '@/features/auth/validation';
import { colors, screenScrollContent, typography } from '@/theme';

type Step = 'email' | 'code';

export default function UpgradeScreen() {
  const router = useRouter();
  const { alert } = useAppDialog();
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
      alert('Account linked', 'Your email is now linked. You can sign in with it next time.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ScreenHeader
            title="Link your email"
            subtitle="Keep your guest data — upgrade to a permanent account."
            onBack={() => router.back()}
          />

          <Card>
            <Text style={[typography.body, { color: c.textMuted }]}>
              {step === 'email'
                ? 'Add an email to turn your guest session into a permanent account. Your data stays exactly as it is.'
                : `Enter the code we sent to ${email}.`}
            </Text>
          </Card>

          <FormSection title={step === 'email' ? 'Your email' : 'Verification code'}>
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
              <OtpCodeField
                value={token}
                onChangeText={setToken}
                error={fieldError}
                onSubmitEditing={onVerify}
              />
            )}
          </FormSection>

          {submitError ? (
            <Text style={[typography.caption, { color: c.danger }]}>{submitError}</Text>
          ) : null}

          {step === 'email' ? (
            <Button label="Send code" onPress={onSendCode} loading={submitting} />
          ) : (
            <Button label="Link email" onPress={onVerify} loading={submitting} />
          )}
          <Button label="Cancel" variant="secondary" onPress={() => router.back()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: screenScrollContent,
});
