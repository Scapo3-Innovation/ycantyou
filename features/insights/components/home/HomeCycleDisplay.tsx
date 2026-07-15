import { format, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { CyclePrediction } from '@/features/tracking/prediction';
import type { Cycle, DailyLog } from '@/types/database';
import { colors, spacing, typography } from '@/theme';

import { PHASE_LABELS } from '../../constants';
import { deriveCycleState } from '../../cycleState';

type HomeCycleDisplayProps = {
  cycles: Cycle[];
  prediction: CyclePrediction;
  selectedDate: string;
  dailyLogs?: DailyLog[];
};

function describe(
  state: ReturnType<typeof deriveCycleState>,
  selectedDate: string,
): {
  label: string;
  value: string;
  hint: string;
} {
  if (state.kind === 'none') {
    return {
      label: 'Get started',
      value: '—',
      hint: 'Log your first period to see your cycle here',
    };
  }
  switch (state.kind) {
    case 'period':
      return { label: 'Period', value: `Day ${state.day}`, hint: 'Bleeding phase' };
    case 'late':
      return {
        label: 'Period',
        value: `${state.days}d late`,
        hint: 'Past estimated start — not a diagnosis',
      };
    case 'cycle':
      return {
        label: state.phase ? `${PHASE_LABELS[state.phase]} phase` : 'Cycle day',
        value: `${state.day}`,
        hint: format(parseISO(selectedDate), 'EEEE'),
      };
  }
}

/** Large centred cycle status — reference-style hero number. */
export function HomeCycleDisplay({
  cycles,
  prediction,
  selectedDate,
  dailyLogs = [],
}: HomeCycleDisplayProps) {
  const state = deriveCycleState({ cycles, prediction, today: selectedDate, dailyLogs });
  const copy = describe(state, selectedDate);
  const isEmpty = state.kind === 'none';

  return (
    <Animated.View entering={FadeInDown.duration(480).springify()} style={styles.wrap}>
      <Text style={[typography.body, styles.label, { color: colors.textMuted }]}>
        {copy.label}:
      </Text>
      <Text
        style={[
          styles.value,
          { color: isEmpty ? colors.textFaint : colors.text },
          isEmpty && styles.valueEmpty,
        ]}>
        {copy.value}
      </Text>
      <Text style={[typography.caption, styles.hint, { color: colors.textMuted }]}>{copy.hint}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: 2,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  valueEmpty: {
    fontSize: 32,
    lineHeight: 36,
  },
  hint: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
