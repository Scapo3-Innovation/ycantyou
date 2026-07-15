import { format, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import type { CyclePrediction } from '@/features/tracking/prediction';
import type { Cycle } from '@/types/database';
import { colors, spacing, typography } from '@/theme';

import { PHASE_LABELS } from '../../constants';
import { deriveCycleState } from '../../cycleState';

type AnalyticsHeroStripProps = {
  cycles: Cycle[];
  prediction: CyclePrediction;
  today: string;
  logsThisWeek: number;
};

const fmt = (iso: string) => format(parseISO(iso), 'd MMM');

function nextPeriodLine(prediction: CyclePrediction): string {
  switch (prediction.status) {
    case 'regular':
      return `Next period ~${fmt(prediction.windowStart)} – ${fmt(prediction.windowEnd)}`;
    case 'irregular':
      return 'Next period estimate uncertain — irregular cycles';
    case 'insufficient':
      return 'Log 2+ periods for period predictions';
  }
}

function describe(state: Exclude<ReturnType<typeof deriveCycleState>, { kind: 'none' }>): string {
  switch (state.kind) {
    case 'period':
      return `Period · day ${state.day}`;
    case 'late':
      return `Period · ${state.days} days late`;
    case 'cycle':
      return state.phase
        ? `Cycle day ${state.day} · ${PHASE_LABELS[state.phase]} phase`
        : `Cycle day ${state.day}`;
  }
}

/** Slim cycle snapshot + key counts — no oversized hero numbers. */
export function AnalyticsHeroStrip({
  cycles,
  prediction,
  today,
  logsThisWeek,
}: AnalyticsHeroStripProps) {
  const router = useRouter();
  const state = deriveCycleState({ cycles, prediction, today });

  if (state.kind === 'none') {
    return (
      <Card style={styles.card}>
        <Text style={[typography.bodyMedium, { color: colors.text }]}>No cycle data yet</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Log your first period to unlock cycle stats and trends.
        </Text>
        <View style={styles.metrics}>
          <Metric label="Check-ins this week" value={String(logsThisWeek)} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Metric label="Periods logged" value="0" />
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/track/period')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
          <Text style={[typography.captionMedium, { color: colors.secondary }]}>Log period</Text>
        </Pressable>
      </Card>
    );
  }

  const avgCycle =
    prediction.status === 'regular' || prediction.status === 'irregular'
      ? `${prediction.avgLength}d avg`
      : '—';

  return (
    <Card style={styles.card}>
      <Text style={[typography.bodyMedium, { color: colors.text }]}>{describe(state)}</Text>
      <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={2}>
        {nextPeriodLine(prediction)}
      </Text>
      <View style={styles.metrics}>
        <Metric label="Check-ins" value={String(logsThisWeek)} sub="this week" />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Metric label="Periods" value={String(cycles.length)} sub="logged" />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Metric label="Cycle" value={avgCycle} sub="length" />
      </View>
    </Card>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={styles.metric}>
      <Text style={[typography.bodyMedium, styles.metricValue, { color: colors.text }]}>
        {value}
      </Text>
      <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={1}>
        {label}
      </Text>
      {sub ? (
        <Text style={[typography.caption, { color: colors.textFaint, fontSize: 11 }]}>{sub}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  metricValue: {
    fontSize: 16,
    lineHeight: 20,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: spacing.xs,
  },
  linkRow: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.88,
  },
});
