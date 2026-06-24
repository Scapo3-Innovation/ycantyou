import { format, parseISO } from 'date-fns';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { CyclePrediction } from '@/features/tracking/prediction';
import { colors, spacing, typography } from '@/theme';

import { PHASE_LABELS } from '../constants';
import { daysSinceStart, deriveCyclePhase } from '../phase';

type StatusCardProps = {
  prediction: CyclePrediction;
  lastStart: string | null;
  today: string;
  onLogToday: () => void;
};

const fmt = (iso: string) => format(parseISO(iso), 'EEE, d MMM');

/**
 * Top-of-dashboard status: current cycle day + phase (derived from the last period start
 * and the average cycle length), the next-period estimate (reused from prediction.ts, kept
 * honest for irregular cycles), and a quick "Log today" action.
 */
export function StatusCard({ prediction, lastStart, today, onLogToday }: StatusCardProps) {
  // Average cycle length is available whenever we have ≥2 logged starts.
  const avgLength =
    prediction.status === 'regular' || prediction.status === 'irregular'
      ? prediction.avgLength
      : null;

  const dayIndex = lastStart ? daysSinceStart(lastStart, today) : null;
  const cycleDay = dayIndex !== null ? dayIndex + 1 : null;
  const phase = dayIndex !== null && avgLength ? deriveCyclePhase(dayIndex, avgLength) : null;

  return (
    <Card>
      {cycleDay !== null ? (
        <>
          <Text style={[typography.caption, styles.eyebrow, { color: colors.primary }]}>
            Cycle day {cycleDay}
          </Text>
          {phase ? (
            <Text style={[typography.h1, { color: colors.text }]}>{PHASE_LABELS[phase]} phase</Text>
          ) : (
            <Text style={[typography.h1, { color: colors.text }]}>Tracking your cycle</Text>
          )}
          {phase && prediction.status === 'irregular' ? (
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Approximate — your cycles vary, so the phase is uncertain.
            </Text>
          ) : null}
        </>
      ) : (
        <Text style={[typography.h1, { color: colors.text }]}>Start tracking</Text>
      )}

      <Text style={[typography.body, styles.next, { color: colors.textMuted }]}>
        {nextPeriodText(prediction)}
      </Text>

      <Button label="Log today" onPress={onLogToday} />
    </Card>
  );
}

/** Honest next-period copy — never a confident date for irregular/insufficient cycles. */
function nextPeriodText(prediction: CyclePrediction): string {
  switch (prediction.status) {
    case 'regular':
      return `Next period (estimate): ${fmt(prediction.windowStart)} – ${fmt(prediction.windowEnd)}`;
    case 'irregular':
      return 'Next period: estimate uncertain — your recent cycles vary too much to predict a date.';
    case 'insufficient':
      return 'Log a couple of periods and we’ll estimate your next one.';
  }
}

const styles = StyleSheet.create({
  eyebrow: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  next: {
    marginTop: spacing.xs,
  },
});
