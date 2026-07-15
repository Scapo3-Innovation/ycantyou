import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { RotterdamExplainer } from '@/features/screener/components/RotterdamExplainer';
import { ScreenerResultHero } from '@/features/screener/components/ScreenerResultHero';
import { useScreenerResult } from '@/features/screener/queries';
import { generateAndShareReport } from '@/features/screener/report';
import { useCycles, useRecentDailyLogs } from '@/features/tracking/queries';
import { colors, spacing, typography } from '@/theme';

export default function ScreenerResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const { data: result, isLoading } = useScreenerResult(sessionId ?? '');
  const { data: cycles = [] } = useCycles();
  const { data: dailyLogs = [] } = useRecentDailyLogs();
  const [sharing, setSharing] = useState(false);

  if (isLoading) return <LoadingScreen />;

  function onBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }

  if (!result) {
    return (
      <Screen>
        <ScreenHeader title="Your result" onBack={onBack} />
        <View style={styles.center}>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            We couldn&apos;t load this result. Please try the screener again.
          </Text>
          <Button label="Back to home" variant="ghost" onPress={() => router.replace('/(tabs)')} />
        </View>
      </Screen>
    );
  }

  async function onCreateReport() {
    const current = result;
    if (!current) return;
    setSharing(true);
    try {
      const ok = await generateAndShareReport({ result: current, cycles, dailyLogs });
      if (!ok) {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('[screener] PDF generation failed', err);
      }
      Alert.alert(
        'Could not create report',
        'Something went wrong generating the PDF. Please try again.',
      );
    } finally {
      setSharing(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <ScreenHeader
            title="Your result"
            subtitle="Screening indication — not a diagnosis"
            onBack={onBack}
          />

          <ScreenerResultHero band={result.risk_band} score={Number(result.score)} />
          <RotterdamExplainer />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <Button
            label="Create doctor report (PDF)"
            onPress={() => void onCreateReport()}
            loading={sharing}
          />
          <Button
            label="View past results"
            variant="ghost"
            onPress={() => router.replace('/(screener)/history')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    gap: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
});
