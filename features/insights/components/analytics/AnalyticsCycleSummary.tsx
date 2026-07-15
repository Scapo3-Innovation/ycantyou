import { format, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { analyticsTypography } from '@/features/insights/components/analytics/analyticsStyles';
import type { CyclePrediction } from '@/features/tracking/prediction';
import type { Cycle } from '@/types/database';
import { colors, spacing } from '@/theme';

import { PHASE_LABELS } from '../../constants';
import { deriveCycleState } from '../../cycleState';

type AnalyticsCycleSummaryProps = {
  cycles: Cycle[];
  prediction: CyclePrediction;
  today: string;
};

const fmt = (iso: string) => format(parseISO(iso), 'EEE, d MMM');

function nextPeriodText(prediction: CyclePrediction): string {
  switch (prediction.status) {
    case 'regular':
      return `Next period (estimate) ${fmt(prediction.windowStart)} – ${fmt(prediction.windowEnd)}`;
    case 'irregular':
      return 'Next period: estimate uncertain — your cycles vary too much to predict a date.';
    case 'insufficient':
      return 'Log a couple of periods and we’ll estimate your next one.';
  }
}

/** Compact cycle snapshot for the analytics tab. */
export function AnalyticsCycleSummary({ cycles, prediction, today }: AnalyticsCycleSummaryProps) {
  const state = deriveCycleState({ cycles, prediction, today });

  if (state.kind === 'none') {
    return (
      <Card style={styles.card}>
        <Text style={[analyticsTypography.section, { color: colors.text }]}>Cycle overview</Text>
        <Text style={[analyticsTypography.body, { color: colors.textMuted }]}>
          Log your first period to unlock cycle analytics.
        </Text>
      </Card>
    );
  }

  const { eyebrow, number, descriptor } = describe(state);

  return (
    <Card style={styles.card}>
      <Text style={[analyticsTypography.micro, styles.eyebrow, { color: colors.primary }]}>
        {eyebrow}
      </Text>
      <Text style={[analyticsTypography.heroNumber, { color: colors.primary }]}>{number}</Text>
      <Text style={[analyticsTypography.body, { color: colors.textMuted }]}>{descriptor}</Text>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Text style={[analyticsTypography.micro, { color: colors.textMuted }]}>
        {nextPeriodText(prediction)}
      </Text>
    </Card>
  );
}

function describe(state: Exclude<ReturnType<typeof deriveCycleState>, { kind: 'none' }>): {
  eyebrow: string;
  number: string;
  descriptor: string;
} {
  switch (state.kind) {
    case 'period':
      return { eyebrow: 'PERIOD', number: `Day ${state.day}`, descriptor: 'Day of your period' };
    case 'late':
      return {
        eyebrow: 'PERIOD',
        number: `${state.days}d late`,
        descriptor: 'Past your estimated date — this is only an estimate.',
      };
    case 'cycle':
      return {
        eyebrow: 'CYCLE DAY',
        number: `${state.day}`,
        descriptor: state.phase ? `${PHASE_LABELS[state.phase]} phase` : 'Tracking your cycle',
      };
  }
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.xs,
  },
});
