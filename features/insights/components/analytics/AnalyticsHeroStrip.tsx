import { format, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { analyticsTypography } from '@/features/insights/components/analytics/analyticsStyles';
import type { CyclePrediction } from '@/features/tracking/prediction';
import type { Cycle } from '@/types/database';
import { colors, spacing } from '@/theme';

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
      return 'Next period: estimate uncertain with irregular cycles';
    case 'insufficient':
      return 'Log 2+ periods to unlock period predictions';
  }
}

/** Compact hero — cycle snapshot + quick stats in one card. */
export function AnalyticsHeroStrip({
  cycles,
  prediction,
  today,
  logsThisWeek,
}: AnalyticsHeroStripProps) {
  const state = deriveCycleState({ cycles, prediction, today });

  if (state.kind === 'none') {
    return (
      <Card style={styles.card}>
        <Text style={[analyticsTypography.section, { color: colors.text }]}>Start tracking</Text>
        <Text style={[analyticsTypography.body, { color: colors.textMuted }]}>
          Log your first period to unlock cycle analytics.
        </Text>
        <View style={styles.statRow}>
          <QuickStat value={String(logsThisWeek)} label="Check-ins this week" />
          <QuickStat value="0" label="Periods logged" />
        </View>
      </Card>
    );
  }

  const { eyebrow, number, descriptor } = describe(state);

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.cycleCol}>
          <Text style={[analyticsTypography.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
          <Text style={[analyticsTypography.heroNumber, { color: colors.text }]}>{number}</Text>
          <Text style={[analyticsTypography.body, { color: colors.textMuted }]} numberOfLines={1}>
            {descriptor}
          </Text>
        </View>
        <View style={styles.statRow}>
          <QuickStat value={String(logsThisWeek)} label="Check-ins" sub="this week" />
          <QuickStat value={String(cycles.length)} label="Periods" sub="logged" />
        </View>
      </View>
      <Text style={[analyticsTypography.micro, { color: colors.textFaint }]} numberOfLines={2}>
        {nextPeriodLine(prediction)}
      </Text>
    </Card>
  );
}

function QuickStat({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={[analyticsTypography.stat, { color: colors.text }]}>{value}</Text>
      <Text style={[analyticsTypography.micro, { color: colors.textMuted }]}>{label}</Text>
      {sub ? (
        <Text style={[analyticsTypography.micro, { color: colors.textFaint }]}>{sub}</Text>
      ) : null}
    </View>
  );
}

function describe(state: Exclude<ReturnType<typeof deriveCycleState>, { kind: 'none' }>): {
  eyebrow: string;
  number: string;
  descriptor: string;
} {
  switch (state.kind) {
    case 'period':
      return { eyebrow: 'Period', number: `Day ${state.day}`, descriptor: 'Current period' };
    case 'late':
      return {
        eyebrow: 'Period',
        number: `${state.days}d late`,
        descriptor: 'Past estimated date',
      };
    case 'cycle':
      return {
        eyebrow: 'Cycle day',
        number: `${state.day}`,
        descriptor: state.phase ? `${PHASE_LABELS[state.phase]} phase` : 'Tracking your cycle',
      };
  }
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  cycleCol: {
    flex: 1,
    gap: 2,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    minWidth: 72,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: 2,
  },
});
