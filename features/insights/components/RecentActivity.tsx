import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FLOW_LEVELS, MOOD_OPTIONS } from '@/features/tracking/constants';
import type { DailyLog } from '@/types/database';
import { colors, radius, spacing, typography } from '@/theme';

import { InsightCard, InsightEmptyState } from './InsightCard';

const FLOW_LABEL = new Map(FLOW_LEVELS.map((entry) => [entry.value, entry.label]));
const RECENT_LIMIT = 5;

function moodIcon(mood: number | null | undefined): keyof typeof Ionicons.glyphMap {
  if (mood == null) return 'ellipse-outline';
  return MOOD_OPTIONS.find((entry) => entry.value === mood)?.icon ?? 'ellipse-outline';
}

function moodTint(mood: number | null | undefined): string {
  if (mood == null) return colors.surfaceAlt;
  return MOOD_OPTIONS.find((entry) => entry.value === mood)?.ring ?? colors.border;
}

/** Recent logs — visual rows, tap to open that day. */
export function RecentActivity({
  logs,
  compact = false,
  embedded = false,
}: {
  logs: DailyLog[];
  compact?: boolean;
  embedded?: boolean;
}) {
  const router = useRouter();
  const recent = logs.slice(0, RECENT_LIMIT);

  return (
    <InsightCard title="Recent activity" compact={compact} embedded={embedded}>
      {recent.length === 0 ? (
        <InsightEmptyState message="No logs yet — tap Log today to start." />
      ) : (
        <View style={styles.list}>
          {recent.map((log, index) => {
            const isLast = index === recent.length - 1;
            const flow =
              log.flow_level && log.flow_level !== 'none'
                ? FLOW_LABEL.get(log.flow_level)
                : null;

            return (
              <Pressable
                key={log.id}
                onPress={() =>
                  router.push({ pathname: '/(tabs)/track/day', params: { date: log.log_date } })
                }
                accessibilityRole="button"
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                <View style={styles.timeline}>
                  <View style={[styles.iconWrap, { backgroundColor: moodTint(log.mood) }]}>
                    <Ionicons name={moodIcon(log.mood)} size={14} color={colors.text} />
                  </View>
                  {!isLast ? <View style={[styles.line, { backgroundColor: colors.border }]} /> : null}
                </View>

                <View style={styles.copy}>
                  <Text style={[typography.bodyMedium, { color: colors.text }]}>
                    {format(parseISO(log.log_date), 'EEE d MMM')}
                  </Text>
                  <View style={styles.metaRow}>
                    {log.mood != null ? (
                      <MetaChip icon="happy-outline" label={`Mood ${log.mood}`} />
                    ) : null}
                    {log.energy != null ? (
                      <MetaChip icon="flash-outline" label={`Energy ${log.energy}`} />
                    ) : null}
                    {flow ? <MetaChip icon="water-outline" label={flow} /> : null}
                    {log.notes ? <MetaChip icon="document-text-outline" label="Notes" /> : null}
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
              </Pressable>
            );
          })}
        </View>
      )}
    </InsightCard>
  );
}

function MetaChip({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={10} color={colors.textMuted} />
      <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minHeight: 56,
    paddingVertical: spacing.xs,
  },
  timeline: {
    width: 32,
    alignItems: 'center',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: spacing.xs,
    marginBottom: -spacing.xs,
    borderRadius: radius.full,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pressed: {
    opacity: 0.9,
  },
});
