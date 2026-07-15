import { format, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorState } from '@/components/ui/ErrorState';
import { HeaderTextButton, ScreenHeader } from '@/components/ui/ScreenHeader';
import { Screen } from '@/components/ui/Screen';
import { buildDayCategories } from '@/features/tracking/dayCategories';
import { CycleCalendarSection } from '@/features/tracking/components/CycleCalendarSection';
import { CycleHistoryList } from '@/features/tracking/components/CycleHistoryList';
import { PredictionCard } from '@/features/tracking/components/PredictionCard';
import { TrackTodayStatusCard } from '@/features/tracking/components/TrackTodayStatusCard';
import { hasDailyLogEntry } from '@/features/tracking/dailyLogSummary';
import { isDateInExistingCycle } from '@/features/tracking/cycleOverlap';
import { computeCyclePrediction } from '@/features/tracking/prediction';
import { getDayStatus } from '@/features/tracking/periodStatus';
import { TourAnchor } from '@/features/tour/TourAnchor';
import { useCycles, useDailyLog, useRecentDailyLogs } from '@/features/tracking/queries';
import { colors, screenScrollContent, spacing, typography } from '@/theme';

export default function TrackScreen() {
  const router = useRouter();
  const c = colors;

  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarView, setCalendarView] = useState<'month' | 'year'>('month');
  const [visibleMonth, setVisibleMonth] = useState(today);
  const [calendarYear, setCalendarYear] = useState(() => parseISO(today).getFullYear());

  const { data: cycles = [], isError, refetch } = useCycles();
  const { data: dailyLogs = [] } = useRecentDailyLogs();
  const { data: todayLog } = useDailyLog(today);

  const prediction = useMemo(() => computeCyclePrediction(cycles), [cycles]);
  const dayCategories = useMemo(
    () => buildDayCategories(cycles, dailyLogs, prediction),
    [cycles, dailyLogs, prediction],
  );

  const todayStatus = useMemo(
    () => getDayStatus(today, today, cycles, dailyLogs, prediction, dayCategories),
    [today, cycles, dailyLogs, prediction, dayCategories],
  );

  const hasTodayLog = useMemo(() => hasDailyLogEntry(todayLog), [todayLog]);
  const todayInLoggedPeriod = useMemo(
    () => isDateInExistingCycle(cycles, today),
    [cycles, today],
  );

  function onCalendarDayPress(dateString: string) {
    setSelectedDate(dateString);
    setVisibleMonth(dateString);
    setCalendarYear(parseISO(dateString).getFullYear());
    if (calendarView === 'year') {
      setCalendarView('month');
    }
  }

  function toggleCalendarView() {
    setCalendarView((mode) => {
      const next = mode === 'month' ? 'year' : 'month';
      if (next === 'year') {
        setCalendarYear(parseISO(selectedDate).getFullYear());
      }
      return next;
    });
  }

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
        <ScreenHeader
          onBack={() => router.push('/(tabs)')}
          right={
            <HeaderTextButton
              label={calendarView === 'month' ? 'Year' : 'Month'}
              onPress={toggleCalendarView}
              accessibilityLabel={
                calendarView === 'month' ? 'Show year view' : 'Show month view'
              }
            />
          }
        />

        <TourAnchor id="tour-track-calendar">
          <CycleCalendarSection
            view={calendarView}
            selectedDate={selectedDate}
            today={today}
            visibleMonth={visibleMonth}
            onVisibleMonthChange={setVisibleMonth}
            calendarYear={calendarYear}
            onYearChange={setCalendarYear}
            categories={dayCategories}
            prediction={prediction}
            onDayPress={onCalendarDayPress}
          />
        </TourAnchor>

        <TrackTodayStatusCard
          status={todayStatus}
          todayLog={todayLog}
          onOpenDay={() =>
            router.push({ pathname: '/(tabs)/track/day', params: { date: today } })
          }
          onLogDetails={() =>
            router.push({ pathname: '/(tabs)/track/day', params: { date: today } })
          }
          onLogPeriod={() => router.push('/(tabs)/track/period')}
          showLogDetails={!hasTodayLog}
          showLogPeriod={!todayInLoggedPeriod}
        />

        <PredictionCard
          prediction={prediction}
          onImproveAccuracy={() =>
            router.push({ pathname: '/(tabs)/track/day', params: { date: today } })
          }
        />

        <View style={styles.section}>
          <Text style={[typography.bodyMedium, { color: c.text }]}>Cycle history</Text>
          <CycleHistoryList
            cycles={cycles}
            onEdit={(cycle) =>
              router.push({ pathname: '/(tabs)/track/period', params: { id: cycle.id } })
            }
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: screenScrollContent,
  section: {
    gap: spacing.sm,
  },
});
