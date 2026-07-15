import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { MiniWellnessChart } from '@/features/insights/components/home/MiniWellnessChart';
import {
  compareWellnessWeeks,
  computeThisWeekScore,
  computeWeeklyWellness,
} from '@/features/insights/wellnessTrend';
import type { DailyLog } from '@/types/database';
import { colors, spacing, typography } from '@/theme';

type AnalyticsWellnessScoreCardProps = {
  dailyLogs: DailyLog[];
  onPress?: () => void;
};

function scoreColor(score: number | null): string {
  if (score == null) return colors.border;
  if (score >= 70) return colors.secondary;
  if (score >= 45) return colors.warning;
  return colors.primary;
}

/** Visual wellness score + mini trend — less text, more at-a-glance. */
export function AnalyticsWellnessScoreCard({
  dailyLogs,
  onPress,
}: AnalyticsWellnessScoreCardProps) {
  const weekScore = computeThisWeekScore(dailyLogs);
  const weeklyPoints = computeWeeklyWellness(dailyLogs);
  const comparison = compareWellnessWeeks(dailyLogs);
  const delta = comparison.deltaPercent;
  const ringColor = scoreColor(weekScore);

  const content = (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <Ionicons name="pulse-outline" size={16} color={colors.secondary} />
        <Text style={[typography.bodyMedium, styles.title, { color: colors.text }]}>
          Wellness score
        </Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.ring, { borderColor: ringColor }]}>
          <Text style={[typography.h2, styles.score, { color: colors.text }]}>
            {weekScore ?? '—'}
          </Text>
          {weekScore != null ? (
            <Text style={[typography.caption, { color: colors.textMuted }]}>%</Text>
          ) : null}
        </View>

        <View style={styles.copy}>
          {delta != null ? (
            <View style={styles.deltaRow}>
              <Ionicons
                name={delta >= 0 ? 'trending-up' : 'trending-down'}
                size={14}
                color={delta >= 0 ? colors.secondary : colors.primary}
              />
              <Text
                style={[
                  typography.captionMedium,
                  styles.deltaText,
                  { color: delta >= 0 ? colors.secondary : colors.primary },
                ]}>
                {delta >= 0 ? `+${delta}%` : `${delta}%`} vs last week
              </Text>
            </View>
          ) : (
            <Text style={[typography.caption, styles.hint, { color: colors.textMuted }]}>
              Log mood or energy to unlock
            </Text>
          )}
        </View>

        <View style={styles.chartWrap}>
          <MiniWellnessChart points={weeklyPoints} />
        </View>
      </View>
    </Card>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ring: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    flexShrink: 0,
  },
  score: {
    fontSize: 22,
    lineHeight: 26,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  hint: {
    lineHeight: 18,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'nowrap',
  },
  deltaText: {
    flexShrink: 1,
  },
  chartWrap: {
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.92,
  },
});
