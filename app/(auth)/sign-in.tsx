import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { FadeInView } from '@/components/ui/FadeInView';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { PrivacyNote } from '@/components/ui/PrivacyNote';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { sendEmailOtp, signInAsGuest } from '@/features/auth/api';
import { emailSchema } from '@/features/auth/validation';
import { PRIVACY_POLICY_URL } from '@/features/onboarding/constants';
import { onboardingImages } from '@/features/onboarding/images';
import { colors, spacing, typography } from '@/theme';

const SHOW_GUEST_SIGN_IN = __DEV__;

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors;

  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

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
    <Screen edgeToEdge>
      <Pressable
        onPress={() => router.push('/(auth)/welcome?replay=1')}
        accessibilityRole="button"
        accessibilityLabel="See how the app works"
        hitSlop={12}
        style={[styles.introLink, { top: insets.top + spacing.sm, right: spacing.lg }]}>
        <Text style={[typography.caption, { color: c.textFaint }]}>How it works</Text>
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <HeroBanner
          image={onboardingImages.cycle}
          title="Sign in"
          subtitle="Enter your email and we'll send you a 6-digit code."
          compact
          topInset={insets.top}
        />

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={[styles.form, screenBodyPadding]}>
            <BrandLogo variant="full" size={180} style={styles.logo} />

            <FadeInView delay={120}>
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
            </FadeInView>

            {submitError ? (
              <Text style={[typography.caption, { color: c.danger }]}>{submitError}</Text>
            ) : null}

            <FadeInView delay={200}>
              <Button label="Send code" onPress={onSubmit} loading={submitting} />
            </FadeInView>

            {SHOW_GUEST_SIGN_IN ? (
              <FadeInView delay={280}>
                <Button
                  label="Continue as guest"
                  variant="secondary"
                  onPress={onContinueAsGuest}
                  loading={guestLoading}
                />
              </FadeInView>
            ) : null}

            <FadeInView delay={360}>
              <PrivacyNote onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)} />
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  form: {
    gap: spacing.lg,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  introLink: {
    position: 'absolute',
    zIndex: 1,
  },
});
