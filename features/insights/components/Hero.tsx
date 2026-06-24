import { format, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import type { CyclePrediction } from '@/features/tracking/prediction';
import type { Cycle } from '@/types/database';
import { colors, spacing, typography } from '@/theme';

import { PHASE_LABELS } from '../constants';
import { deriveCycleState } from '../cycleState';

type HeroProps = {
  cycles: Cycle[];
  prediction: CyclePrediction;
  today: string;
};

const fmt = (iso: string) => format(parseISO(iso), 'EEE, d MMM');

/** Honest next-period copy — never a confident date for irregular/insufficient cycles. */
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

/** The dashboard hero: a big, readable cycle-state number + the honest next-period estimate. */
export function Hero({ cycles, prediction, today }: HeroProps) {
  const state = deriveCycleState({ cycles, prediction, today });

  if (state.kind === 'none') {
    return (
      <Card>
        <Text style={[typography.h1, { color: colors.text }]}>Welcome</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Log your first period to see your cycle here.
        </Text>
      </Card>
    );
  }

  const { eyebrow, number, descriptor } = describe(state);

  return (
    <Card>
      <Text style={[typography.caption, styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
      <Text style={[styles.bigNumber, { color: colors.primary }]}>{number}</Text>
      <Text style={[typography.body, { color: colors.textMuted }]}>{descriptor}</Text>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Text style={[typography.caption, { color: colors.textMuted }]}>
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
  eyebrow: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bigNumber: {
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.xs,
  },
});
