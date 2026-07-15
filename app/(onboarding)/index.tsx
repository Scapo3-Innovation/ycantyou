import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { ScrollHint } from '@/components/ui/ScrollHint';
import { useAuth } from '@/features/auth/AuthProvider';
import { hasHealthDataConsent, recordConsent } from '@/features/onboarding/api';
import {
  CONSENT_BLOCKS,
  CONSENT_CHECKBOX_LABEL,
  CONSENT_INTRO,
} from '@/features/onboarding/consentCopy';
import { ConsentSummary } from '@/features/onboarding/components/ConsentSummary';
import { onboardingImages } from '@/features/onboarding/images';
import { analytics } from '@/lib/analytics';
import { colors, spacing, typography } from '@/theme';

const CONSENT_HERO_HEIGHT = 200;
const SCROLL_END_THRESHOLD = 48;

export default function ConsentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const userId = session?.user.id;
  const c = colors;

  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [reachedBottom, setReachedBottom] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    const timer = setTimeout(() => {
      void hasHealthDataConsent(userId)
        .then((exists) => {
          if (!mounted || !exists) return;
          router.replace('/(onboarding)/details');
        })
        .catch(() => {
          /* Show consent UI — user can still proceed */
        });
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [userId, router]);

  const markReachedBottom = useCallback(() => {
    setReachedBottom((prev) => (prev ? prev : true));
  }, []);

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

  const canConsent = reachedBottom;

  return (
    <Screen edgeToEdge>
      <View style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
          onContentSizeChange={(_, height) => setContentHeight(height)}>
          <HeroBanner
            image={onboardingImages.privacy}
            compact
            photoHeight={CONSENT_HERO_HEIGHT}
            topInset={insets.top}
          />

          <View style={[styles.body, screenBodyPadding]}>
            <View style={styles.header}>
              <Text style={[typography.h1, { color: c.text }]}>Privacy & consent</Text>
              <Text style={[typography.body, styles.intro, { color: c.textMuted }]}>
                {CONSENT_INTRO}
              </Text>
            </View>

            <ConsentSummary blocks={CONSENT_BLOCKS} />

            <View style={styles.footer}>
              <Checkbox
                checked={agreed}
                onChange={setAgreed}
                disabled={!canConsent}
                label={CONSENT_CHECKBOX_LABEL}
              />

              {error ? (
                <Text style={[typography.caption, { color: c.danger }]}>{error}</Text>
              ) : null}

              <Button
                label="Agree and continue"
                onPress={onContinue}
                disabled={!canConsent || !agreed}
                loading={submitting}
              />
            </View>
          </View>
        </ScrollView>

        <ScrollHint visible={!reachedBottom} bottomInset={insets.bottom} />
      </View>
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
  body: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  intro: {
    lineHeight: 22,
  },
  footer: {
    gap: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
