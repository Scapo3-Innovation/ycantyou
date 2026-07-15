import { Ionicons } from '@expo/vector-icons';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { Cycle } from '@/types/database';

type CycleHistoryListProps = {
  cycles: Cycle[];
  onEdit: (cycle: Cycle) => void;
};

const fmt = (iso: string) => format(parseISO(iso), 'd MMM yyyy');

function cycleSearchText(cycle: Cycle): string {
  const parts = [
    fmt(cycle.start_date),
    cycle.end_date ? fmt(cycle.end_date) : 'ongoing',
    cycle.notes ?? '',
  ];
  return parts.join(' ').toLowerCase();
}

/**
 * Past periods, newest first — searchable by date or notes.
 */
export function CycleHistoryList({ cycles, onEdit }: CycleHistoryListProps) {
  const c = colors;
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return cycles;
    return cycles.filter((cycle) => cycleSearchText(cycle).includes(trimmed));
  }, [cycles, query]);

  if (cycles.length === 0) {
    return (
      <Text style={[typography.body, { color: c.textMuted }]}>
        No periods logged yet. Tap “Log period” to add one.
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.searchBar, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Ionicons name="search-outline" size={18} color={c.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by date or notes"
          placeholderTextColor={c.textFaint}
          accessibilityLabel="Search cycle history"
          style={[typography.body, styles.searchInput, { color: c.text }]}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {filtered.length === 0 ? (
        <Text style={[typography.caption, { color: c.textMuted }]}>
          No periods match “{query.trim()}”.
        </Text>
      ) : (
        <View style={styles.list}>
          {filtered.map((cycle) => {
            const index = cycles.findIndex((item) => item.id === cycle.id);
            const newer = index > 0 ? cycles[index - 1] : undefined;
            const length =
              newer != null
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
                  {length != null && length > 0 ? (
                    <Text style={[typography.caption, { color: c.textMuted }]}>
                      {length}-day cycle
                    </Text>
                  ) : null}
                  {cycle.notes ? (
                    <Text style={[typography.caption, { color: c.textFaint }]} numberOfLines={1}>
                      {cycle.notes}
                    </Text>
                  ) : null}
                </View>
                <Text style={[typography.caption, { color: c.primary }]}>Edit</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
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
    flex: 1,
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
});
