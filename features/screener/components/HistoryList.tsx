import { format, parseISO } from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { RiskBand, ScreenerResult } from '@/types/database';

import { RISK_BAND_LABEL } from '../constants';

type HistoryListProps = {
  results: ScreenerResult[];
  onSelect: (sessionId: string) => void;
};

/** Past screener results, newest first. Tap to reopen a result. */
export function HistoryList({ results, onSelect }: HistoryListProps) {
  const c = colors;
  const bandColor: Record<RiskBand, string> = {
    low: c.success,
    moderate: c.warning,
    high: c.danger,
  };

  if (results.length === 0) {
    return (
      <Text style={[typography.body, { color: c.textMuted }]}>
        No past screenings yet.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {results.map((r) => (
        <Pressable
          key={r.id}
          onPress={() => onSelect(r.session_id)}
          accessibilityRole="button"
          style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.rowText}>
            <Text style={[typography.body, { color: c.text }]}>
              {format(parseISO(r.created_at), 'd MMM yyyy')}
            </Text>
            <Text style={[typography.caption, { color: c.textMuted }]}>
              {RISK_BAND_LABEL[r.risk_band]}
            </Text>
          </View>
          <View style={[styles.dot, { backgroundColor: bandColor[r.risk_band] }]} />
        </Pressable>
      ))}
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
  dot: {
    width: 14,
    height: 14,
    borderRadius: radius.full,
  },
});
