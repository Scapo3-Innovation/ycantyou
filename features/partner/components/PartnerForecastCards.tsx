import { format, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/theme';
import type { PartnerDashboardPrediction } from '@/types/database';

type PartnerForecastCardsProps = {
  prediction: PartnerDashboardPrediction;
};

const fmt = (iso: string) => format(parseISO(iso), 'd MMM');

export function PartnerForecastCards({ prediction }: PartnerForecastCardsProps) {
  if (prediction.status === 'insufficient') {
    return (
      <Card>
        <Text style={[typography.captionMedium, styles.eyebrow, { color: colors.textMuted }]}>
          COMING UP
        </Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Not enough logged periods yet for an estimate.
        </Text>
      </Card>
    );
  }

  if (prediction.status === 'irregular') {
    return (
      <Card>
        <Text style={[typography.captionMedium, styles.eyebrow, { color: colors.textMuted }]}>
          CYCLE PATTERN
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.warning }]}>
          Irregular cycles — dates are uncertain
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Recent cycles vary by {prediction.spread} days. Keep plans flexible and check in with her.
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.row}>
      {prediction.next_period ? (
        <Card style={[styles.card, { backgroundColor: colors.roseTint }]}>
          <Text style={[typography.captionMedium, { color: colors.textMuted }]}>NEXT PERIOD</Text>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>
            {fmt(prediction.next_period.window_start)} – {fmt(prediction.next_period.window_end)}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Estimate only</Text>
        </Card>
      ) : null}
      {prediction.fertile ? (
        <Card style={[styles.card, { backgroundColor: colors.tealTint }]}>
          <Text style={[typography.captionMedium, { color: colors.textMuted }]}>FERTILE WINDOW</Text>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>
            {fmt(prediction.fertile.start)} – {fmt(prediction.fertile.end)}
          </Text>
          <Text style={[typography.caption, { color: colors.warning }]}>Not contraception</Text>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    letterSpacing: 0.6,
  },
});
