import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { Goal } from '@/types/database';
import { colors, radius, spacing, typography } from '@/theme';

import { GOAL_TIPS } from './homeCopy';

type HomeGoalTipProps = {
  goal: Goal | null;
};

/** Goal-focused tip banner from onboarding preference. */
export function HomeGoalTip({ goal }: HomeGoalTipProps) {
  if (!goal) return null;

  const tip = GOAL_TIPS[goal];
  const labels: Record<Goal, string> = {
    cycle: 'Cycle focus',
    fertility: 'Fertility focus',
    symptoms: 'Symptoms focus',
    weight: 'Weight focus',
    mood: 'Mood focus',
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.copy}>
          <Text style={[typography.captionMedium, { color: colors.primary }]}>
            {labels[goal]}
          </Text>
          <Text style={[typography.body, { color: colors.text }]}>{tip}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FCE8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
});
