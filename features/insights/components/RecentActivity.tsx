import { format, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import { FLOW_LEVELS } from '@/features/tracking/constants';
import type { DailyLog } from '@/types/database';
import { colors, spacing, typography } from '@/theme';

import { InsightCard, InsightEmptyState } from './InsightCard';

const FLOW_LABEL = new Map(FLOW_LEVELS.map((f) => [f.value, f.label]));
const RECENT_LIMIT = 5;

/** Last few logged days, with flow / mood / energy at a glance. */
export function RecentActivity({ logs }: { logs: DailyLog[] }) {
  const c = colors;

  const recent = logs.slice(0, RECENT_LIMIT);

  return (
    <InsightCard title="Recent activity">
      {recent.length === 0 ? (
        <InsightEmptyState message="No logs yet. Tap Log today to start." />
      ) : (
        <View style={styles.list}>
          {recent.map((log) => {
            const parts: string[] = [];
            if (log.flow_level && log.flow_level !== 'none') {
              parts.push(`${FLOW_LABEL.get(log.flow_level) ?? log.flow_level} flow`);
            }
            if (log.mood != null) parts.push(`Mood ${log.mood}/5`);
            if (log.energy != null) parts.push(`Energy ${log.energy}/5`);
            if (log.notes) parts.push('Notes');
            return (
              <View key={log.id} style={styles.row}>
                <Text style={[typography.body, { color: c.text }]}>
                  {format(parseISO(log.log_date), 'EEE d MMM')}
                </Text>
                <Text style={[typography.caption, styles.detail, { color: c.textMuted }]}>
                  {parts.length > 0 ? parts.join(' · ') : '—'}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </InsightCard>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  detail: {
    flexShrink: 1,
    textAlign: 'right',
  },
});
