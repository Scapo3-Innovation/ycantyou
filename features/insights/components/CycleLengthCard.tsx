import { StyleSheet, Text, View } from 'react-native';

import { IRREGULAR_SPREAD_DAYS } from '@/features/tracking/constants';
import { colors, radius, spacing, typography } from '@/theme';

import { MIN_CYCLES_FOR_TREND } from '../constants';
import type { CycleLengthStats } from '../types';
import { InsightCard, InsightEmptyState } from './InsightCard';
import { RangeBar } from './RangeBar';

/** Cycle-length trend: average + regular/irregular, from server-side stats. */
export function CycleLengthCard({
  stats,
  compact = false,
  embedded = false,
}: {
  stats: CycleLengthStats | undefined;
  compact?: boolean;
  embedded?: boolean;
}) {
  const c = colors;

  const enough =
    stats &&
    stats.n_cycles >= MIN_CYCLES_FOR_TREND &&
    stats.avg_length != null &&
    stats.min_length != null &&
    stats.max_length != null &&
    stats.spread != null;

  const headlineStyle = compact || embedded ? typography.bodyMedium : typography.h1;

  if (!enough) {
    return (
      <InsightCard title="Cycle length" compact={compact} embedded={embedded}>
        <InsightEmptyState message="Log at least two periods and we’ll show your cycle-length trend." />
      </InsightCard>
    );
  }

  const regular = stats.spread! <= IRREGULAR_SPREAD_DAYS;

  return (
    <InsightCard title="Cycle length" compact={compact} embedded={embedded}>
      <View style={styles.headerRow}>
        <Text style={[headlineStyle, { color: c.text }]}>
          {stats.avg_length} days
        </Text>
        <View style={[styles.badge, { backgroundColor: regular ? c.success : c.warning }]}>
          <Text style={[typography.caption, styles.badgeText, { color: c.primaryText }]}>
            {regular ? 'Fairly regular' : 'Irregular'}
          </Text>
        </View>
      </View>

      <RangeBar min={stats.min_length!} max={stats.max_length!} avg={stats.avg_length!} />

      <Text style={[typography.caption, { color: c.textMuted }]}>
        Based on your last {stats.n_cycles} cycles. They vary by about {stats.spread} days
        {regular ? '.' : ' — common with PCOS.'} This describes your own logs, not a diagnosis.
      </Text>
    </InsightCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeText: {
    fontWeight: '600',
  },
});
