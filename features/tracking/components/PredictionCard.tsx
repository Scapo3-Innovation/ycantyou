import { format, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/theme';

import type { CyclePrediction } from '../prediction';
import { FertileWindowNote } from './FertileWindowNote';

const fmt = (iso: string) => format(parseISO(iso), 'EEE, d MMM');

type PredictionCardProps = {
  prediction: CyclePrediction;
  onImproveAccuracy?: () => void;
};

/**
 * Next-period estimate card — reference layout with illustration and accuracy banner.
 */
export function PredictionCard({ prediction, onImproveAccuracy }: PredictionCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.main}>
        <View style={styles.illustration}>
          <Ionicons name="calendar" size={28} color={colors.secondary} />
        </View>

        <View style={styles.copy}>
          <Text style={[typography.captionMedium, styles.eyebrow, { color: colors.textMuted }]}>
            NEXT PERIOD · ESTIMATE
          </Text>

          {prediction.status === 'insufficient' ? (
            <Text style={[typography.bodyMedium, { color: colors.text }]}>
              Log a couple of periods and we&apos;ll estimate your next one. We won&apos;t guess
              without enough data.
            </Text>
          ) : null}

          {prediction.status === 'irregular' ? (
            <View style={styles.block}>
              <View style={styles.warningRow}>
                <Text style={[typography.bodyMedium, { color: colors.warning }]}>
                  Irregular — estimate uncertain
                </Text>
                <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
              </View>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Your recent cycles vary by {prediction.spread} days (averaging about{' '}
                {prediction.avgLength}). That&apos;s too variable to predict a reliable date.
              </Text>
            </View>
          ) : null}

          {prediction.status === 'regular' ? (
            <View style={styles.block}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>
                {fmt(prediction.windowStart)} – {fmt(prediction.windowEnd)}
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Estimated from your {prediction.basis}-cycle average (~{prediction.avgLength} days).
                This is an estimate, not a certainty.
              </Text>
              {prediction.fertile ? (
                <View style={styles.block}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    Estimated fertile window: {fmt(prediction.fertile.start)} –{' '}
                    {fmt(prediction.fertile.end)}
                  </Text>
                  <FertileWindowNote />
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      <Pressable
        onPress={onImproveAccuracy}
        accessibilityRole="button"
        accessibilityLabel="Keep logging to improve accuracy"
        style={({ pressed }) => [styles.banner, pressed && styles.pressed]}>
        <View style={styles.bannerIcon}>
          <Ionicons name="leaf-outline" size={16} color={colors.secondary} />
        </View>
        <View style={styles.bannerCopy}>
          <Text style={[typography.captionMedium, { color: colors.secondary }]}>
            Keep logging to improve accuracy
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Your insights get more accurate over time.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.secondary} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    gap: 0,
  },
  main: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  illustration: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  eyebrow: {
    letterSpacing: 0.6,
  },
  block: {
    gap: spacing.xs,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.tealTint,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCopy: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.92,
  },
});
