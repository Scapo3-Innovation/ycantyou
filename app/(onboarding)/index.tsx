import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { hasHealthDataConsent, recordConsent } from '@/features/onboarding/api';
import { PRIVACY_POLICY_URL } from '@/features/onboarding/constants';
import { colors, spacing, typography } from '@/theme';

export default function ConsentScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  const [checking, setChecking] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  // Resume support: if consent for the current version already exists, skip ahead.
  useEffect(() => {
    let mounted = true;
    if (!userId) return;
    hasHealthDataConsent(userId)
      .then((exists) => {
        if (!mounted) return;
        if (exists) {
          router.replace('/(onboarding)/details');
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        if (mounted) setChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, [userId, router]);

  async function onContinue() {
    if (!userId || !agreed) return;
    setError(undefined);
    setSubmitting(true);
    try {
      await recordConsent(userId);
      router.replace('/(onboarding)/details');
    } catch {
      setError('Could not save your consent. Please try again.');
      setSubmitting(false);
    }
  }

  if (checking) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[typography.title, { color: c.text }]}>Your privacy & consent</Text>

        <Text style={[typography.body, { color: c.text }]}>
          This app helps you understand and manage your menstrual and PCOS-related health. To do
          that, we process health information you choose to share — like your cycle, symptoms, and
          goals.
        </Text>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[typography.body, { color: c.text }]}>We promise to:</Text>
          <Text style={[typography.body, { color: c.textMuted }]}>
            • Collect only what a feature needs.{'\n'}• Keep your data encrypted and never sell it.
            {'\n'}• Let you export or delete everything, anytime.
          </Text>
        </View>

        <Text style={[typography.caption, { color: c.textMuted }]}>
          Under India&apos;s DPDP Act, your consent is explicit and revocable. You can withdraw it
          later from your profile.
        </Text>

        <Text
          style={[typography.body, styles.link, { color: c.primary }]}
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          accessibilityRole="link">
          Read the privacy policy
        </Text>

        <Checkbox
          checked={agreed}
          onChange={setAgreed}
          label="I consent to the processing of my health data as described above."
        />

        {error ? <Text style={[typography.caption, { color: c.danger }]}>{error}</Text> : null}

        <Button label="Continue" onPress={onContinue} disabled={!agreed} loading={submitting} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  link: {
    fontWeight: '600',
  },
});
