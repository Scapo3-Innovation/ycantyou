import { Ionicons } from '@expo/vector-icons';
import { format, subDays } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorState } from '@/components/ui/ErrorState';
import { PremiumListItem } from '@/components/ui/PremiumListItem';
import { PremiumSection } from '@/components/ui/PremiumSection';
import { Screen } from '@/components/ui/Screen';
import {
  computeTrendPoints,
  periodLabel,
  type AnalyticsPeriod,
} from '@/features/insights/analyticsSeries';
import { AnalyticsHeroStrip } from '@/features/insights/components/analytics/AnalyticsHeroStrip';
import { AnalyticsInsightBanner } from '@/features/insights/components/analytics/AnalyticsInsightBanner';
import {
  AnalyticsMetricTabs,
  type AnalyticsMetric,
} from '@/features/insights/components/analytics/AnalyticsMetricTabs';
import { AnalyticsPeriodTabs } from '@/features/insights/components/analytics/AnalyticsPeriodTabs';
import { analyticsTypography } from '@/features/insights/components/analytics/analyticsStyles';
import { InteractiveTrendChart } from '@/features/insights/components/analytics/InteractiveTrendChart';
import {
  PcosChangeChart,
  PcosChangeDetail,
} from '@/features/insights/components/analytics/PcosChangeChart';
import { TrendDetailPanel } from '@/features/insights/components/analytics/TrendDetailPanel';
import { CycleLengthCard } from '@/features/insights/components/CycleLengthCard';
import { RecentActivity } from '@/features/insights/components/RecentActivity';
import { SymptomPatternCard } from '@/features/insights/components/SymptomPatternCard';
import { comparePcosTrend, computePcosTrendPoints } from '@/features/insights/pcosTrend';
import { useCycleLengthStats, useSymptomPhasePatterns } from '@/features/insights/queries';
import { selectSymptomInsights } from '@/features/insights/select';
import { compareWellnessWeeks } from '@/features/insights/wellnessTrend';
import { useScreenerHistory } from '@/features/screener/queries';
import { TourAnchor } from '@/features/tour/TourAnchor';
import { computeCyclePrediction } from '@/features/tracking/prediction';
import { useCycles, useRecentDailyLogs } from '@/features/tracking/queries';
import { colors, radius, screenScrollContent, spacing } from '@/theme';

export default function AnalyticsScreen() {
  const router = useRouter();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [period, setPeriod] = useState<AnalyticsPeriod>('4w');
  const [metric, setMetric] = useState<AnalyticsMetric>('signs');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [pcosSelectedIndex, setPcosSelectedIndex] = useState<number | null>(null);

  const { data: cycles = [], isError, refetch } = useCycles();
  const { data: dailyLogs = [] } = useRecentDailyLogs();
  const { data: cycleStats } = useCycleLengthStats();
  const { data: symptomPatterns = [] } = useSymptomPhasePatterns();
  const { data: screenerHistory = [] } = useScreenerHistory();

  const prediction = useMemo(() => computeCyclePrediction(cycles), [cycles]);
  const symptomInsights = useMemo(
    () => selectSymptomInsights(symptomPatterns),
    [symptomPatterns],
  );
  const trendPoints = useMemo(
    () => computeTrendPoints(dailyLogs, period),
    [dailyLogs, period],
  );
  const pcosPoints = useMemo(
    () => computePcosTrendPoints(dailyLogs, cycles, screenerHistory, period),
    [dailyLogs, cycles, screenerHistory, period],
  );
  const wellnessComparison = useMemo(() => compareWellnessWeeks(dailyLogs), [dailyLogs]);
  const pcosComparison = useMemo(() => comparePcosTrend(pcosPoints), [pcosPoints]);

  const logsThisWeek = useMemo(() => {
    const weekStart = format(subDays(new Date(), 6), 'yyyy-MM-dd');
    return dailyLogs.filter((log) => log.log_date >= weekStart).length;
  }, [dailyLogs]);

  const selectedPoint = selectedIndex == null ? null : (trendPoints[selectedIndex] ?? null);
  const selectedPcosPoint =
    pcosSelectedIndex == null ? null : (pcosPoints[pcosSelectedIndex] ?? null);

  useEffect(() => {
    setSelectedIndex(null);
    setPcosSelectedIndex(null);
  }, [period, metric]);

  const delta = wellnessComparison.deltaPercent;
  const showDeltaHighlight =
    delta != null &&
    (wellnessComparison.headline === 'Your symptoms are' ||
      wellnessComparison.headline === 'Your check-ins are');
  const deltaLabel =
    delta == null
      ? ''
      : delta >= 0
        ? `${Math.abs(delta)}% better`
        : `${Math.abs(delta)}% lower`;

  if (isError) {
    return (
      <Screen>
        <ErrorState onRetry={() => void refetch()} />
      </Screen>
    );
  }

  const hasChartSelection = metric === 'signs' ? selectedPcosPoint != null : selectedPoint != null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[analyticsTypography.title, { color: colors.text }]}>Analytics</Text>
          <Text style={[analyticsTypography.micro, { color: colors.textFaint }]}>
            From your logs only — not a diagnosis
          </Text>
        </View>

        <AnalyticsHeroStrip
          cycles={cycles}
          prediction={prediction}
          today={today}
          logsThisWeek={logsThisWeek}
        />

        <PremiumSection label="Trends">
          <TourAnchor id="tour-analytics-trends">
            <View style={[styles.trendsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AnalyticsPeriodTabs value={period} onChange={setPeriod} />
              <AnalyticsMetricTabs value={metric} onChange={setMetric} />

            <Text style={[analyticsTypography.micro, { color: colors.textFaint }]}>
              {periodLabel(period)}
              {metric === 'signs' ? ' · stress, flow & screener' : ' · mood & energy'}
            </Text>

            {metric === 'signs' ? (
              <>
                <PcosChangeChart
                  points={pcosPoints}
                  selectedIndex={pcosSelectedIndex}
                  onSelectIndex={setPcosSelectedIndex}
                />
                <PcosChangeDetail point={selectedPcosPoint} />
                <AnalyticsInsightBanner
                  headline={pcosComparison.headline}
                  subline={pcosComparison.subline}
                />
                <Pressable
                  onPress={() => router.push('/(screener)/intro')}
                  accessibilityRole="button"
                  accessibilityLabel="Take PCOS screener"
                  style={({ pressed }) => [styles.inlineLink, pressed && styles.pressed]}>
                  <Text style={[analyticsTypography.bodyMedium, { color: colors.secondary }]}>
                    Take PCOS screener
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.secondary} />
                </Pressable>
              </>
            ) : (
              <>
                <InteractiveTrendChart
                  points={trendPoints}
                  selectedIndex={selectedIndex}
                  onSelectIndex={setSelectedIndex}
                />
                <TrendDetailPanel point={selectedPoint} />
                <AnalyticsInsightBanner
                  headline={wellnessComparison.headline}
                  highlight={showDeltaHighlight ? deltaLabel : undefined}
                  subline={wellnessComparison.subline}
                />
              </>
            )}

            {!hasChartSelection ? (
              <Text style={[analyticsTypography.micro, styles.chartHint, { color: colors.textFaint }]}>
                Tap a bar to inspect that period
              </Text>
            ) : null}
            </View>
          </TourAnchor>
        </PremiumSection>

        <PremiumSection label="More insights">
          <View style={styles.moreCards}>
            <CycleLengthCard stats={cycleStats} compact />
            <SymptomPatternCard insights={symptomInsights} compact />
            <RecentActivity logs={dailyLogs} compact />
          </View>
        </PremiumSection>

        <PremiumListItem
          title="Calendar & logs"
          subtitle="Open tracking to add or edit entries"
          leftIcon="calendar-outline"
          onPress={() => router.push('/(tabs)/track')}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    ...screenScrollContent,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  trendsCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  chartHint: {
    textAlign: 'center',
    marginTop: -spacing.xs,
  },
  moreCards: {
    gap: spacing.sm,
  },
  inlineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.88,
  },
});
