import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { MOOD_OPTIONS } from '@/features/tracking/constants';
import type { DayWellnessDot } from '@/features/insights/wellnessTrend';
import { colors, radius, spacing, typography } from '@/theme';

type AnalyticsWeekDotsProps = {
  days: DayWellnessDot[];
  today: string;
};

function hapticTap() {
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

function moodColor(mood: number | null, hasLog: boolean): string {
  if (!hasLog) return colors.border;
  const option = MOOD_OPTIONS.find((entry) => entry.value === mood);
  return option?.ring ?? colors.secondary;
}

/** Tappable 7-day strip — tap a day to open or create that log. */
export function AnalyticsWeekDots({ days, today }: AnalyticsWeekDotsProps) {
  const router = useRouter();

  function onDayPress(date: string) {
    hapticTap();
    router.push({ pathname: '/(tabs)/track/day', params: { date } });
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[typography.bodyMedium, { color: colors.text }]}>This week</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Tap a day to log</Text>
      </View>

      <View style={styles.strip}>
        {days.map((day) => {
          const isToday = day.date === today;
          const fill = moodColor(day.mood, day.hasLog);
          return (
            <Pressable
              key={day.date}
              onPress={() => onDayPress(day.date)}
              accessibilityRole="button"
              accessibilityLabel={`${day.label}${day.hasLog ? ', logged' : ', no log'}`}
              style={({ pressed }) => [styles.dayCol, pressed && styles.pressed]}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: day.hasLog ? fill : colors.surfaceAlt,
                    borderColor: isToday ? colors.primary : day.hasLog ? fill : colors.border,
                    borderWidth: isToday ? 2 : 1.5,
                  },
                ]}>
                {day.hasLog && day.score != null ? (
                  <Text style={[typography.captionMedium, styles.dotScore, { color: colors.primaryText }]}>
                    {Math.round(day.score)}
                  </Text>
                ) : (
                  <View style={[styles.emptyMark, { backgroundColor: colors.border }]} />
                )}
              </View>
              <Text
                style={[
                  typography.caption,
                  styles.dayLabel,
                  { color: isToday ? colors.primary : colors.textMuted },
                ]}>
                {day.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotScore: {
    fontSize: 11,
    lineHeight: 14,
  },
  emptyMark: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dayLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.9,
  },
});
