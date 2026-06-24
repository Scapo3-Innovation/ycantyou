import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { FadeInView } from '@/components/ui/FadeInView';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { sendEmailOtp, verifyEmailOtp } from '@/features/auth/api';
import { otpSchema } from '@/features/auth/validation';
import { onboardingImages } from '@/features/onboarding/images';
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
    <Screen edgeToEdge>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <HeroBanner
            compact
            image={onboardingImages.screening}
            icon="keypad-outline"
            title="Check your inbox"
            subtitle={`We sent a 6-digit code to ${email}.`}
          />

          <View style={[styles.form, screenBodyPadding]}>
            <FadeInView delay={120}>
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
            </FadeInView>

            {submitError ? (
              <Text style={[typography.caption, { color: c.danger }]}>{submitError}</Text>
            ) : null}
            {resent ? (
              <Text style={[typography.caption, { color: c.success }]}>
                A new code is on its way.
              </Text>
            ) : null}

            <FadeInView delay={200}>
              <Button label="Verify" onPress={onVerify} loading={submitting} />
            </FadeInView>
            <FadeInView delay={280}>
              <Button
                label="Resend code"
                variant="secondary"
                onPress={onResend}
                loading={resending}
              />
            </FadeInView>
            <FadeInView delay={360}>
              <Button
                label="Use a different email"
                variant="secondary"
                onPress={() => router.back()}
              />
            </FadeInView>
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
    paddingBottom: spacing.xxl,
  },
  form: {
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
});
