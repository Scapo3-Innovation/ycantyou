import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { MiniWellnessChart } from '@/features/insights/components/home/MiniWellnessChart';
import {
  compareWellnessWeeks,
  computeWeeklyWellness,
} from '@/features/insights/wellnessTrend';
import { MOOD_OPTIONS } from '@/features/tracking/constants';
import type { DailyLog, DailyLogWithSymptoms } from '@/types/database';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type HomeWellnessSectionProps = {
  log: DailyLogWithSymptoms | null | undefined;
  dailyLogs: DailyLog[];
  onViewHistory: () => void;
  onOpenDailyLog: (mood?: number) => void;
  onOpenAnalytics: () => void;
  onScreener: () => void;
};

function hapticTap() {
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

/** Reference-style wellness cards below the hero quick actions. */
export function HomeWellnessSection({
  log,
  dailyLogs,
  onViewHistory,
  onOpenDailyLog,
  onOpenAnalytics,
  onScreener,
}: HomeWellnessSectionProps) {
  const weeklyPoints = computeWeeklyWellness(dailyLogs);
  const comparison = compareWellnessWeeks(dailyLogs);
  const hasDailyLog = Boolean(log);

  function onMoodSelect(mood: number) {
    hapticTap();
    onOpenDailyLog(mood);
  }

  const delta = comparison.deltaPercent;
  const showDeltaHighlight =
    delta != null &&
    (comparison.headline === 'Your symptoms are' ||
      comparison.headline === 'Your check-ins are');

  const deltaLabel =
    delta == null
      ? ''
      : delta >= 0
        ? `${Math.abs(delta)}% better`
        : `${Math.abs(delta)}% lower`;

  return (
    <View style={styles.wrap}>
      {!hasDailyLog ? (
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[typography.bodyMedium, styles.cardTitle, { color: colors.text }]}>
              How are you feeling today?
            </Text>
            <Pressable
              onPress={onViewHistory}
              accessibilityRole="button"
              accessibilityLabel="View mood history"
              hitSlop={8}>
              <Text style={[typography.captionMedium, { color: colors.secondary }]}>
                View history ›
              </Text>
            </Pressable>
          </View>

          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => onMoodSelect(option.value)}
                accessibilityRole="button"
                accessibilityLabel={`Mood: ${option.label}`}
                style={styles.moodItem}>
                <View style={styles.moodOrb}>
                  <Ionicons
                    name={option.icon}
                    size={22}
                    color={colors.textMuted}
                  />
                </View>
                <Text
                  style={[typography.caption, styles.moodLabel, { color: colors.textMuted }]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}

      <Pressable
        onPress={onOpenAnalytics}
        accessibilityRole="button"
        accessibilityLabel="Open health analytics">
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.insightTitleRow}>
              <Ionicons name="analytics-outline" size={18} color={colors.secondary} />
              <Text style={[typography.bodyMedium, { color: colors.text }]}>Insight</Text>
            </View>
            <View style={styles.periodPill}>
              <Text style={[typography.captionMedium, { color: colors.textMuted }]}>
                This week
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
            </View>
          </View>

          <View style={styles.insightBody}>
            <View style={styles.insightCopy}>
              {showDeltaHighlight ? (
                <Text style={[typography.body, { color: colors.text }]}>
                  {comparison.headline}{' '}
                  <Text style={styles.deltaHighlight}>{deltaLabel}</Text>{' '}
                  {comparison.subline}
                </Text>
              ) : (
                <>
                  <Text style={[typography.bodyMedium, { color: colors.text }]}>
                    {comparison.headline}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {comparison.subline}
                  </Text>
                </>
              )}
            </View>
            <MiniWellnessChart points={weeklyPoints} />
          </View>
        </Card>
      </Pressable>

      <Card style={[styles.card, styles.screenerCard]}>
        <View style={styles.screenerIconWrap}>
          <Ionicons name="search-outline" size={22} color={colors.secondaryText} />
        </View>
        <View style={styles.screenerCopy}>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>
            Understand your PCOS risk
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Check your symptoms in 5 minutes.
          </Text>
        </View>
        <Pressable
          onPress={onScreener}
          accessibilityRole="button"
          accessibilityLabel="Start PCOS screener"
          style={({ pressed }) => [styles.screenerBtn, pressed && styles.pressed]}>
          <Text style={[typography.captionMedium, { color: colors.secondaryText }]}>
            Start screener
          </Text>
        </Pressable>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  moodItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  moodOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodLabel: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  insightBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  insightCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  deltaHighlight: {
    color: colors.secondary,
    fontSize: 22,
    fontWeight: '700',
  },
  screenerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  screenerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenerCopy: {
    flex: 1,
    gap: 2,
  },
  screenerBtn: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
});
