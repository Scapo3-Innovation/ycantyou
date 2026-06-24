import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, useColorScheme } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { CycleLengthCard } from '@/features/insights/components/CycleLengthCard';
import { RecentActivity } from '@/features/insights/components/RecentActivity';
import { StatusCard } from '@/features/insights/components/StatusCard';
import { SymptomPatternCard } from '@/features/insights/components/SymptomPatternCard';
import { useCycleLengthStats, useSymptomPhasePatterns } from '@/features/insights/queries';
import { selectSymptomInsights } from '@/features/insights/select';
import { ScreenerCta } from '@/features/screener/components/ScreenerCta';
import { computeCyclePrediction } from '@/features/tracking/prediction';
import { useCycles, useRecentDailyLogs } from '@/features/tracking/queries';
import { colors, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];
  const today = format(new Date(), 'yyyy-MM-dd');

  // Reuse Module 4's hooks + prediction; insights trends come from server-side RPCs.
  const { data: cycles = [] } = useCycles();
  const { data: dailyLogs = [] } = useRecentDailyLogs();
  const { data: cycleStats } = useCycleLengthStats();
  const { data: symptomPatterns = [] } = useSymptomPhasePatterns();

  const prediction = useMemo(() => computeCyclePrediction(cycles), [cycles]);
  const lastStart = cycles[0]?.start_date ?? null; // cycles are newest-first
  const symptomInsights = useMemo(
    () => selectSymptomInsights(symptomPatterns),
    [symptomPatterns],
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[typography.title, { color: c.text }]}>Home</Text>

        <StatusCard
          prediction={prediction}
          lastStart={lastStart}
          today={today}
          onLogToday={() =>
            router.push({ pathname: '/(tabs)/track/day', params: { date: today } })
          }
        />

        <ScreenerCta onPress={() => router.push('/(screener)/intro')} />

        <RecentActivity logs={dailyLogs} />

        <CycleLengthCard stats={cycleStats} />

        <SymptomPatternCard insights={symptomInsights} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
