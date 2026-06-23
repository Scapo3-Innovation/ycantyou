import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { buildMarkedDates, type CalendarPalette } from '@/features/tracking/calendar';
import { CycleHistoryList } from '@/features/tracking/components/CycleHistoryList';
import { PredictionCard } from '@/features/tracking/components/PredictionCard';
import { computeCyclePrediction } from '@/features/tracking/prediction';
import {
  notificationsSupported,
  scheduleEstimatedPeriodReminder,
} from '@/features/tracking/notifications';
import { useCycles, useRecentDailyLogs } from '@/features/tracking/queries';
import { useReminders } from '@/features/tracking/useReminders';
import { colors, spacing, typography } from '@/theme';

export default function TrackScreen() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);

  const { data: cycles = [] } = useCycles();
  const { data: dailyLogs = [] } = useRecentDailyLogs();
  const reminders = useReminders();

  const prediction = useMemo(() => computeCyclePrediction(cycles), [cycles]);

  const palette = useMemo<CalendarPalette>(
    () => ({
      periodBg: c.primary,
      periodText: c.primaryText,
      fertileBg: scheme === 'light' ? '#DCEFE6' : '#274539',
      fertileText: c.text,
      predictedBorder: c.primary,
      predictedText: c.primary,
      loggedDot: c.textMuted,
      todayRing: c.textMuted,
      selectedRing: c.primary,
      text: c.text,
    }),
    [c, scheme],
  );

  const markedDates = useMemo(
    () => buildMarkedDates({ cycles, dailyLogs, prediction, selectedDate, today, palette }),
    [cycles, dailyLogs, prediction, selectedDate, today, palette],
  );

  // Keep the estimated-period reminder in sync once reminders are on and a date exists.
  useEffect(() => {
    if (reminders.enabled && prediction.status === 'regular') {
      void scheduleEstimatedPeriodReminder(prediction.predictedStart);
    }
  }, [reminders.enabled, prediction]);

  async function onToggleReminders() {
    const ok = await reminders.setEnabled(!reminders.enabled);
    if (!ok && !reminders.enabled) {
      Alert.alert(
        'Notifications off',
        'Enable notifications for this app in your device settings to get reminders.',
      );
    }
  }

  const selectedLabel = format(new Date(`${selectedDate}T00:00:00`), 'EEE, d MMM');

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[typography.title, { color: c.text }]}>Track</Text>

        <Calendar
          markingType="custom"
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          enableSwipeMonths
          theme={{
            calendarBackground: c.background,
            dayTextColor: c.text,
            monthTextColor: c.text,
            textDisabledColor: c.textMuted,
            arrowColor: c.primary,
            todayTextColor: c.primary,
            textSectionTitleColor: c.textMuted,
          }}
        />

        <Legend />

        <View style={styles.actions}>
          <Button
            label={`Log details · ${selectedLabel}`}
            onPress={() =>
              router.push({ pathname: '/(tabs)/track/day', params: { date: selectedDate } })
            }
          />
          <Button label="Log period" variant="secondary" onPress={() => router.push('/(tabs)/track/period')} />
        </View>

        <PredictionCard prediction={prediction} />

        <View style={styles.section}>
          <Text style={[typography.heading, { color: c.text }]}>Reminders</Text>
          <Text style={[typography.caption, { color: c.textMuted }]}>
            A gentle daily nudge to log, plus a heads-up before your estimated period. These are
            on-device reminders.
          </Text>
          {notificationsSupported ? (
            <Button
              label={reminders.enabled ? 'Turn off daily reminder' : 'Turn on daily reminder'}
              variant="secondary"
              loading={reminders.busy || reminders.loading}
              onPress={onToggleReminders}
            />
          ) : (
            <Text style={[typography.caption, { color: c.textMuted }]}>
              Reminders aren&apos;t available in Expo Go on Android — they&apos;ll work in a
              development build.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[typography.heading, { color: c.text }]}>Cycle history</Text>
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

/** Small color key for the calendar marks. */
function Legend() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];
  const items = [
    { color: c.primary, label: 'Period' },
    { color: scheme === 'light' ? '#DCEFE6' : '#274539', label: 'Fertile (est.)' },
  ];
  return (
    <View style={styles.legend}>
      {items.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={[typography.caption, { color: c.textMuted }]}>{item.label}</Text>
        </View>
      ))}
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, styles.legendDashed, { borderColor: c.primary }]} />
        <Text style={[typography.caption, { color: c.textMuted }]}>Next period (est.)</Text>
      </View>
    </View>
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
  section: {
    gap: spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendDashed: {
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
});
