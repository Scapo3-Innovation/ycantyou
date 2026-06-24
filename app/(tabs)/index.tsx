import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { ErrorState } from '@/components/ui/ErrorState';
import { Screen } from '@/components/ui/Screen';
import { CycleLengthCard } from '@/features/insights/components/CycleLengthCard';
import { Hero } from '@/features/insights/components/Hero';
import { QuickActions } from '@/features/insights/components/QuickActions';
import { RecentActivity } from '@/features/insights/components/RecentActivity';
import { SymptomPatternCard } from '@/features/insights/components/SymptomPatternCard';
import { useCycleLengthStats, useSymptomPhasePatterns } from '@/features/insights/queries';
import { selectSymptomInsights } from '@/features/insights/select';
import { ScreenerCta } from '@/features/screener/components/ScreenerCta';
import { computeCyclePrediction } from '@/features/tracking/prediction';
import { useCycles, useRecentDailyLogs } from '@/features/tracking/queries';
import { colors, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Reuse Module 4's hooks + prediction; insights trends come from server-side RPCs.
  const { data: cycles = [], isError, refetch } = useCycles();
  const { data: dailyLogs = [] } = useRecentDailyLogs();
  const { data: cycleStats } = useCycleLengthStats();
  const { data: symptomPatterns = [] } = useSymptomPhasePatterns();

  const prediction = useMemo(() => computeCyclePrediction(cycles), [cycles]);
  const symptomInsights = useMemo(() => selectSymptomInsights(symptomPatterns), [symptomPatterns]);

  if (isError) {
    return (
      <Screen>
        <ErrorState onRetry={() => void refetch()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[typography.title, { color: colors.text }]}>Home</Text>

        <Hero cycles={cycles} prediction={prediction} today={today} />

        <QuickActions
          onLogPeriod={() => router.push('/(tabs)/track/period')}
          onDailyLog={() => router.push({ pathname: '/(tabs)/track/day', params: { date: today } })}
          onScreener={() => router.push('/(screener)/intro')}
        />

        <ScreenerCta onPress={() => router.push('/(screener)/intro')} />

        <CycleLengthCard stats={cycleStats} />

        <SymptomPatternCard insights={symptomInsights} />

        <RecentActivity logs={dailyLogs} />
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
