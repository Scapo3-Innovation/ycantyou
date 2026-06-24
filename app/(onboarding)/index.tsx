import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { PromiseList } from '@/components/ui/PromiseList';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { hasHealthDataConsent, recordConsent } from '@/features/onboarding/api';
import { CONSENT_SECTIONS } from '@/features/onboarding/consentCopy';
import { PRIVACY_POLICY_URL } from '@/features/onboarding/constants';
import { onboardingImages } from '@/features/onboarding/images';
import { analytics } from '@/lib/analytics';
import { colors, spacing, typography } from '@/theme';

const SCROLL_END_THRESHOLD = 48;

export default function ConsentScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const c = colors;

  const [checking, setChecking] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [reachedBottom, setReachedBottom] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

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

  const markReachedBottom = useCallback(() => {
    setReachedBottom((prev) => (prev ? prev : true));
  }, []);

  // Short screens: if everything fits without scrolling, allow consent once laid out.
  useEffect(() => {
    if (viewportHeight > 0 && contentHeight > 0 && contentHeight <= viewportHeight + SCROLL_END_THRESHOLD) {
      markReachedBottom();
    }
  }, [viewportHeight, contentHeight, markReachedBottom]);

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const atBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - SCROLL_END_THRESHOLD;
    if (atBottom) markReachedBottom();
  }

  async function onContinue() {
    if (!userId || !agreed || !reachedBottom) return;
    setError(undefined);
    setSubmitting(true);
    try {
      await recordConsent(userId);
      analytics.track('consent_granted');
      router.replace('/(onboarding)/details');
    } catch {
      setError('Could not save your consent. Please try again.');
      setSubmitting(false);
    }
  }

  if (checking) return <LoadingScreen />;

  const canConsent = reachedBottom;

  return (
    <Screen edgeToEdge>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
        onContentSizeChange={(_, height) => setContentHeight(height)}>
        <HeroBanner
          image={onboardingImages.privacy}
          title="Your privacy & consent"
          subtitle="Your health data stays yours — we only use what you choose to share."
        />

        <View style={[styles.body, screenBodyPadding]}>
          <Text style={[typography.body, { color: c.text }]}>
            This app helps you understand and manage your menstrual and PCOS-related health — your
            cycle, symptoms, and goals. Please read the summary below before giving consent.
          </Text>

          <PromiseList />

          <View style={styles.sections}>
            {CONSENT_SECTIONS.map((section) => (
              <Card key={section.title}>
                <Text style={[typography.bodyMedium, { color: c.text }]}>{section.title}</Text>
                {section.paragraphs.map((paragraph) => (
                  <Text
                    key={paragraph}
                    style={[typography.body, styles.paragraph, { color: c.textMuted }]}>
                    {paragraph}
                  </Text>
                ))}
              </Card>
            ))}
          </View>

          <Text style={[typography.caption, { color: c.textMuted }]}>
            Under India&apos;s DPDP Act, your consent is explicit and revocable. You can withdraw it
            later from your profile.
          </Text>

          <Text
            style={[typography.body, styles.link, { color: c.primary }]}
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
            accessibilityRole="link">
            Read the full privacy policy
          </Text>

          <View style={styles.consentActions}>
            {!canConsent ? (
              <Text style={[typography.caption, styles.scrollHint, { color: c.textMuted }]}>
                Scroll to the bottom to enable consent
              </Text>
            ) : null}

            <Checkbox
              checked={agreed}
              onChange={setAgreed}
              disabled={!canConsent}
              label="I consent to the processing of my health data as described above."
            />

            {error ? (
              <Text style={[typography.caption, { color: c.danger }]}>{error}</Text>
            ) : null}

            <Button
              label="Continue"
              onPress={onContinue}
              disabled={!canConsent || !agreed}
              loading={submitting}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
  },
  body: {
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  sections: {
    gap: spacing.md,
  },
  paragraph: {
    marginTop: spacing.xs,
  },
  link: {
    fontWeight: '600',
  },
  consentActions: {
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  scrollHint: {
    textAlign: 'center',
    fontWeight: '600',
  },
});
