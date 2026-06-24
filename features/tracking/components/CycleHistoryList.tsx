import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { Cycle } from '@/types/database';

type CycleHistoryListProps = {
  cycles: Cycle[];
  onEdit: (cycle: Cycle) => void;
};

const fmt = (iso: string) => format(parseISO(iso), 'd MMM yyyy');

/**
 * Past periods, newest first. Shows the bleed span and, where two consecutive starts
 * exist, the resulting cycle length. Tap a row to edit it.
 */
export function CycleHistoryList({ cycles, onEdit }: CycleHistoryListProps) {
  const c = colors;

  if (cycles.length === 0) {
    return (
      <Text style={[typography.body, { color: c.textMuted }]}>
        No periods logged yet. Tap “Log period” to add one.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {cycles.map((cycle, index) => {
        // Cycle length = days from this start to the next (newer) start, when available.
        const newer = cycles[index - 1];
        const length = newer
          ? differenceInCalendarDays(parseISO(newer.start_date), parseISO(cycle.start_date))
          : null;
        return (
          <Pressable
            key={cycle.id}
            onPress={() => onEdit(cycle)}
            accessibilityRole="button"
            accessibilityHint="Edit this period"
            style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.rowText}>
              <Text style={[typography.body, { color: c.text }]}>
                {fmt(cycle.start_date)}
                {cycle.end_date ? ` – ${fmt(cycle.end_date)}` : ' · ongoing'}
              </Text>
              {length && length > 0 ? (
                <Text style={[typography.caption, { color: c.textMuted }]}>
                  {length}-day cycle
                </Text>
              ) : null}
            </View>
            <Text style={[typography.caption, { color: c.primary }]}>Edit</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  rowText: {
    gap: spacing.xs,
  },
});
