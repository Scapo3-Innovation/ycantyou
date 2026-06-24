import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { ResultDisclaimer } from '@/features/screener/components/ResultDisclaimer';
import { RiskBandIndicator } from '@/features/screener/components/RiskBandIndicator';
import { RotterdamExplainer } from '@/features/screener/components/RotterdamExplainer';
import { useScreenerResult } from '@/features/screener/queries';
import { generateAndShareReport } from '@/features/screener/report';
import { useCycles, useRecentDailyLogs } from '@/features/tracking/queries';
import { colors, spacing, typography } from '@/theme';

export default function ScreenerResultScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const c = colors;

  const { data: result, isLoading } = useScreenerResult(sessionId ?? '');
  const { data: cycles = [] } = useCycles();
  const { data: dailyLogs = [] } = useRecentDailyLogs();
  const [sharing, setSharing] = useState(false);

  if (isLoading) return <LoadingScreen />;

  if (!result) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={[typography.body, { color: c.textMuted }]}>
            We couldn’t load this result. Please try the screener again.
          </Text>
          <Button label="Back to home" variant="secondary" onPress={() => router.replace('/(tabs)')} />
        </View>
      </Screen>
    );
  }

  async function onCreateReport() {
    if (!result) return;
    setSharing(true);
    try {
      const ok = await generateAndShareReport({ result, cycles, dailyLogs });
      if (!ok) {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      }
    } catch {
      Alert.alert('Could not create report', 'Something went wrong generating the PDF. Please try again.');
    } finally {
      setSharing(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Disclaimer first and prominent — never let the band read as a diagnosis. */}
        <ResultDisclaimer />

        <RiskBandIndicator band={result.risk_band} />

        <RotterdamExplainer />

        <View style={styles.actions}>
          <Button label="Create doctor report (PDF)" onPress={onCreateReport} loading={sharing} />
          <Button
            label="View past results"
            variant="secondary"
            onPress={() => router.replace('/(screener)/history')}
          />
          <Button label="Back to home" variant="secondary" onPress={() => router.replace('/(tabs)')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
});
