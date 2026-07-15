import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { getPeriodEngagement } from '@/features/tracking/periodLogEngagement';
import { colors, radius, spacing, typography } from '@/theme';

type PeriodLogEngagementProps = {
  start: string;
  end: string | null;
};

/** Compact tip shown after period dates are picked. */
export function PeriodLogEngagement({ start, end }: PeriodLogEngagementProps) {
  const content = getPeriodEngagement(start, end);
  const selectionKey = `${start}-${end ?? 'ongoing'}`;

  return (
    <Animated.View
      key={selectionKey}
      entering={FadeInDown.duration(320).springify().damping(18)}
      style={styles.wrap}>
      <View style={styles.iconRing}>
        <Ionicons name="sparkles" size={16} color={colors.primary} />
      </View>

      <View style={styles.copy}>
        <View style={styles.metaRow}>
          {content.stat ? (
            <View style={styles.statPill}>
              <Text style={[typography.captionMedium, { color: colors.primary }]}>
                {content.stat}
              </Text>
            </View>
          ) : null}
          <Text style={[typography.captionMedium, { color: colors.secondary }]}>
            {content.eyebrow}
          </Text>
        </View>
        <Text style={[typography.caption, styles.message, { color: colors.textMuted }]}>
          {content.message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.roseTint,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(231, 106, 138, 0.18)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconRing: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  message: {
    lineHeight: 17,
  },
});
