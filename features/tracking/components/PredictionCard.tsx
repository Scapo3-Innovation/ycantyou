import { format, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/theme';

import type { CyclePrediction } from '../prediction';
import { FertileWindowNote } from './FertileWindowNote';

const fmt = (iso: string) => format(parseISO(iso), 'EEE, d MMM');

/**
 * Shows the next-period estimate honestly:
 *  - insufficient data → a prompt to log more,
 *  - irregular cycles → an explicit "estimate uncertain" message (no fake date),
 *  - regular cycles → a dated window (clearly labeled an estimate) + disclaimed fertile window.
 */
export function PredictionCard({ prediction }: { prediction: CyclePrediction }) {
  return (
    <Card>
      <Text style={[typography.caption, styles.eyebrow, { color: colors.textMuted }]}>
        Next period · estimate
      </Text>

      {prediction.status === 'insufficient' ? (
        <Text style={[typography.body, { color: colors.text }]}>
          Log a couple of periods and we&apos;ll estimate your next one. We won&apos;t guess without
          enough data.
        </Text>
      ) : null}

      {prediction.status === 'irregular' ? (
        <View style={styles.block}>
          <Text style={[typography.h2, { color: colors.warning }]}>
            Irregular — estimate uncertain
          </Text>
          <Text style={[typography.body, { color: colors.text }]}>
            Your recent cycles vary by {prediction.spread} days (averaging about{' '}
            {prediction.avgLength}). That&apos;s too variable to predict a reliable date — common
            with PCOS. Keep logging to spot patterns.
          </Text>
        </View>
      ) : null}

      {prediction.status === 'regular' ? (
        <View style={styles.block}>
          <Text style={[typography.h2, { color: colors.text }]}>
            {fmt(prediction.windowStart)} – {fmt(prediction.windowEnd)}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Estimated from your {prediction.basis}-cycle average (~{prediction.avgLength} days). This
            is an estimate, not a certainty.
          </Text>

          {prediction.fertile ? (
            <View style={styles.block}>
              <Text style={[typography.body, { color: colors.text }]}>
                Estimated fertile window: {fmt(prediction.fertile.start)} –{' '}
                {fmt(prediction.fertile.end)}
              </Text>
              <FertileWindowNote />
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  block: {
    gap: spacing.sm,
  },
});
