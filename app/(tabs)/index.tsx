import { format, subDays } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { ErrorState } from '@/components/ui/ErrorState';
import { Screen } from '@/components/ui/Screen';
import { HomeCycleDisplay } from '@/features/insights/components/home/HomeCycleDisplay';
import { HomeDayCard } from '@/features/insights/components/home/HomeDayCard';
import { HomeForecastCards } from '@/features/insights/components/home/HomeForecastCards';
import { HomeGoalTip } from '@/features/insights/components/home/HomeGoalTip';
import { HomeInsightsRail } from '@/features/insights/components/home/HomeInsightsRail';
import { HomeOrbActions } from '@/features/insights/components/home/HomeOrbActions';
import { HomeQuickLinks } from '@/features/insights/components/home/HomeQuickLinks';
import { HomeTopBar } from '@/features/insights/components/home/HomeTopBar';
import { HomeWellnessSection } from '@/features/insights/components/home/HomeWellnessSection';
import { HomeWeekStrip, type HomeWeekStripHandle } from '@/features/insights/components/home/HomeWeekStrip';
import { useCycleLengthStats, useSymptomPhasePatterns } from '@/features/insights/queries';
import { selectSymptomInsights } from '@/features/insights/select';
import { useProfile } from '@/features/profile/useProfile';
import { useScreenerHistory } from '@/features/screener/queries';
import { buildDayCategories } from '@/features/tracking/dayCategories';
import { TourAnchor } from '@/features/tour/TourAnchor';
import { findCycleToEdit } from '@/features/tracking/cycleOverlap';
import { computeCyclePrediction } from '@/features/tracking/prediction';
import { useCycles, useDailyLog, useRecentDailyLogs } from '@/features/tracking/queries';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors, floatingTabBarScrollInset, spacing } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const heroMinHeight = Math.round(windowHeight * 0.58);
  const { session } = useAuth();
  const userId = session?.user.id;
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const weekStripRef = useRef<HomeWeekStripHandle>(null);

  const { data: profile } = useProfile(userId);
  const { data: cycles = [], isError, refetch } = useCycles();
  const { data: dailyLogs = [] } = useRecentDailyLogs();
  const { data: selectedLog, isLoading: logLoading } = useDailyLog(selectedDate);
  const { data: cycleStats } = useCycleLengthStats();
  const { data: symptomPatterns = [] } = useSymptomPhasePatterns();
  const { data: screenerHistory = [] } = useScreenerHistory();

  const prediction = useMemo(() => computeCyclePrediction(cycles), [cycles]);
  const symptomInsights = useMemo(() => selectSymptomInsights(symptomPatterns), [symptomPatterns]);
  const dayCategories = useMemo(
    () => buildDayCategories(cycles, dailyLogs, prediction),
    [cycles, dailyLogs, prediction],
  );

  const logsThisWeek = useMemo(() => {
    const weekStart = format(subDays(new Date(), 6), 'yyyy-MM-dd');
    return dailyLogs.filter((log) => log.log_date >= weekStart).length;
  }, [dailyLogs]);

  const lastScreener = screenerHistory[0];

  function onEditPeriod() {
    const cycle = findCycleToEdit(cycles, today);
    if (cycle) {
      router.push({ pathname: '/(tabs)/track/period', params: { id: cycle.id } });
    } else {
      router.push('/(tabs)/track/period');
    }
  }

  if (isError) {
    return (
      <Screen>
        <ErrorState onRetry={() => void refetch()} />
      </Screen>
    );
  }

  return (
    <Screen edgeToEdge>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.roseTint, colors.background, colors.surface]}
          locations={[0, 0.45, 1]}
          style={[styles.hero, { minHeight: heroMinHeight }]}>
          <View style={styles.blobA} />
          <View style={styles.blobB} />

          <HomeTopBar
            today={today}
            selectedDate={selectedDate}
            userName={profile?.full_name}
            onGoToToday={() => weekStripRef.current?.scrollToToday()}
          />

          <TourAnchor id="tour-home-week">
            <HomeWeekStrip
              ref={weekStripRef}
              today={today}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              categories={dayCategories}
              prediction={prediction}
            />
          </TourAnchor>

          <View style={styles.heroBody}>
            <HomeCycleDisplay
              cycles={cycles}
              prediction={prediction}
              selectedDate={selectedDate}
              dailyLogs={dailyLogs}
            />

            <View style={styles.heroActionsSlot}>
              <TourAnchor id="tour-home-orbs" style={styles.orbsAnchor}>
                <HomeOrbActions
                  onEditPeriod={onEditPeriod}
                  onDailyLog={() =>
                    router.push({ pathname: '/(tabs)/track/day', params: { date: selectedDate } })
                  }
                  onScreener={() => router.push('/(screener)/intro')}
                />
              </TourAnchor>
            </View>
          </View>
        </LinearGradient>

        <HomeWellnessSection
          log={selectedLog}
          dailyLogs={dailyLogs}
          onViewHistory={() => router.push('/(tabs)/track')}
          onOpenDailyLog={(mood) =>
            router.push({
              pathname: '/(tabs)/track/day',
              params: {
                date: selectedDate,
                ...(mood != null ? { mood: String(mood) } : {}),
              },
            })
          }
          onOpenAnalytics={() => router.push('/(tabs)/analytics')}
          onScreener={() => router.push('/(screener)/intro')}
        />

        <HomeGoalTip goal={profile?.goal ?? null} />

        <HomeDayCard
          selectedDate={selectedDate}
          log={selectedLog}
          isLoading={logLoading}
          onLog={() =>
            router.push({ pathname: '/(tabs)/track/day', params: { date: selectedDate } })
          }
        />

        <HomeForecastCards prediction={prediction} />

        <HomeInsightsRail
          selectedDate={selectedDate}
          stats={cycleStats}
          insights={symptomInsights}
          recentLog={dailyLogs[0]}
          logsThisWeek={logsThisWeek}
          onCycleInsight={() => router.push('/(tabs)/track')}
          onSymptomInsight={() => router.push('/(tabs)/track')}
          onScreener={() => router.push('/(screener)/intro')}
          onRecentLog={() =>
            router.push({
              pathname: '/(tabs)/track/day',
              params: { date: dailyLogs[0]?.log_date ?? selectedDate },
            })
          }
        />

        <HomeQuickLinks
          lastScreener={lastScreener}
          logsThisWeek={logsThisWeek}
          onCalendar={() => router.push('/(tabs)/track')}
          onCommunity={() => router.push('/(tabs)/community')}
          onScreener={() => router.push('/(screener)/intro')}
          onScreenerHistory={() => router.push('/(screener)/history')}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: floatingTabBarScrollInset,
  },
  hero: {
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  heroBody: {
    flex: 1,
  },
  heroActionsSlot: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  orbsAnchor: {
    alignSelf: 'center',
  },
  blobA: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    top: -40,
    right: -30,
  },
  blobB: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(231, 106, 138, 0.15)',
    bottom: 80,
    left: -20,
  },
});
