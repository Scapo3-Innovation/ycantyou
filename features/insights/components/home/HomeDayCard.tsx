import { format, parseISO } from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FLOW_LEVELS } from '@/features/tracking/constants';
import type { DailyLogWithSymptoms } from '@/types/database';
import { colors, radius, spacing, typography } from '@/theme';

type HomeDayCardProps = {
  selectedDate: string;
  log: DailyLogWithSymptoms | null | undefined;
  isLoading: boolean;
  onLog: () => void;
};

function flowLabel(level: DailyLogWithSymptoms['flow_level']): string | null {
  if (!level || level === 'none') return null;
  return FLOW_LEVELS.find((f) => f.value === level)?.label ?? level;
}

/** Summary of the selected day's log, or a prompt to log. */
export function HomeDayCard({ selectedDate, log, isLoading, onLog }: HomeDayCardProps) {
  const dateLabel = format(parseISO(selectedDate), 'EEEE, d MMMM');
  const flow = log ? flowLabel(log.flow_level) : null;

  return (
    <View style={styles.wrap}>
      <Text style={[typography.captionMedium, styles.sectionLabel, { color: colors.textMuted }]}>
        Day log
      </Text>
      <Pressable
        onPress={onLog}
        accessibilityRole="button"
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.header}>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>{dateLabel}</Text>
          <Text style={[typography.caption, { color: colors.primary }]}>
            {log ? 'Edit' : 'Log now'}
          </Text>
        </View>

        {isLoading ? (
          <Text style={[typography.caption, { color: colors.textMuted }]}>Loading…</Text>
        ) : log ? (
          <View style={styles.stats}>
            {flow ? <StatChip label="Flow" value={flow} /> : null}
            {log.mood != null ? <StatChip label="Mood" value={`${log.mood}/5`} /> : null}
            {log.energy != null ? <StatChip label="Energy" value={`${log.energy}/5`} /> : null}
            {log.symptom_codes.length > 0 ? (
              <StatChip
                label="Symptoms"
                value={`${log.symptom_codes.length} logged`}
              />
            ) : null}
            {!flow && log.mood == null && log.energy == null && log.symptom_codes.length === 0 ? (
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Logged — tap to add mood, flow, or symptoms.
              </Text>
            ) : null}
          </View>
        ) : (
          <Text style={[typography.body, { color: colors.textMuted }]}>
            Nothing logged yet. Tap to record flow, mood, energy, or symptoms.
          </Text>
        )}
      </Pressable>
    </View>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={[typography.caption, { color: colors.textFaint }]}>{label}</Text>
      <Text style={[typography.captionMedium, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
});
