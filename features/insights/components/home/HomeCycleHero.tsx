import { format, parseISO } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import type { CyclePrediction } from '@/features/tracking/prediction';
import type { Cycle } from '@/types/database';
import { colors, radius, spacing, typography } from '@/theme';

import { PHASE_LABELS } from '../../constants';
import { deriveCycleState } from '../../cycleState';

type HomeCycleHeroProps = {
  cycles: Cycle[];
  prediction: CyclePrediction;
  today: string;
};

const fmt = (iso: string) => format(parseISO(iso), 'EEE, d MMM');

function nextPeriodLine(prediction: CyclePrediction): string {
  switch (prediction.status) {
    case 'regular':
      return `Next period estimate · ${fmt(prediction.windowStart)} – ${fmt(prediction.windowEnd)}`;
    case 'irregular':
      return 'Next period · estimate uncertain for irregular cycles';
    case 'insufficient':
      return 'Log two periods to unlock predictions';
  }
}

function cycleProgress(state: ReturnType<typeof deriveCycleState>, avgLength: number | null): number {
  if (state.kind === 'none') return 0;
  if (state.kind === 'period') return Math.min(state.day / 7, 1);
  if (state.kind === 'late') return 1;
  if (avgLength && avgLength > 0) return Math.min(state.day / avgLength, 1);
  return Math.min(state.day / 28, 1);
}

/** Gradient cycle status card with progress arc and honest prediction copy. */
export function HomeCycleHero({ cycles, prediction, today }: HomeCycleHeroProps) {
  const state = deriveCycleState({ cycles, prediction, today });
  const avgLength =
    prediction.status === 'regular' || prediction.status === 'irregular'
      ? prediction.avgLength
      : null;
  const progress = cycleProgress(state, avgLength);
  const todayLabel = format(parseISO(today), 'EEEE, d MMMM');

  if (state.kind === 'none') {
    return (
      <Animated.View entering={FadeIn.duration(500)}>
        <LinearGradient
          colors={['#FCE8EF', '#FFF5F8', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}>
          <Text style={[typography.caption, styles.eyebrow, { color: colors.primary }]}>
            GET STARTED
          </Text>
          <Text style={[typography.h1, { color: colors.text }]}>Your cycle, understood</Text>
          <Text style={[typography.body, styles.sub, { color: colors.textMuted }]}>
            Log your first period to unlock your personal calendar and day-by-day insights.
          </Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  const headline = describe(state);

  return (
    <Animated.View entering={FadeInDown.duration(520).springify().damping(18)}>
      <LinearGradient
        colors={['#FCE8EF', '#FFF8FA', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.gradient}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{todayLabel}</Text>

        <View style={styles.statRow}>
          <View style={styles.statBlock}>
            <Text style={[typography.caption, styles.eyebrow, { color: colors.primary }]}>
              {headline.eyebrow}
            </Text>
            <Text style={styles.heroNumber}>{headline.number}</Text>
            <Text style={[typography.body, { color: colors.textMuted }]}>{headline.descriptor}</Text>
          </View>

          <View style={styles.ring}>
            <View style={[styles.ringTrack, { borderColor: colors.border }]}>
              <View
                style={[
                  styles.ringFill,
                  {
                    borderColor: colors.primary,
                    borderTopColor: progress > 0.25 ? colors.primary : 'transparent',
                    borderRightColor: progress > 0.5 ? colors.primary : 'transparent',
                    borderBottomColor: progress > 0.75 ? colors.primary : 'transparent',
                    borderLeftColor: progress > 0 ? colors.primary : 'transparent',
                  },
                ]}
              />
            </View>
            <Text style={[typography.caption, styles.ringLabel, { color: colors.textMuted }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View
            entering={FadeIn.delay(200).duration(600)}
            style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]}
          />
        </View>

        <Text style={[typography.caption, styles.estimate, { color: colors.textMuted }]}>
          {nextPeriodLine(prediction)}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}

function describe(state: Exclude<ReturnType<typeof deriveCycleState>, { kind: 'none' }>) {
  switch (state.kind) {
    case 'period':
      return { eyebrow: 'PERIOD', number: `Day ${state.day}`, descriptor: 'Bleeding phase' };
    case 'late':
      return {
        eyebrow: 'PERIOD',
        number: `${state.days}d`,
        descriptor: 'Past estimated start — not a diagnosis',
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
  gradient: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  eyebrow: {
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sub: {
    marginTop: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  statBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  heroNumber: {
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -1,
  },
  ring: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  ringTrack: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringFill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 36,
    borderWidth: 6,
    transform: [{ rotate: '-45deg' }],
  },
  ringLabel: {
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  estimate: {
    lineHeight: 18,
  },
});
