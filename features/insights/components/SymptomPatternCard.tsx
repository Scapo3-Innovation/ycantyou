import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { PHASE_LABELS } from '../constants';
import type { SymptomInsight } from '../types';
import { InsightCard, InsightEmptyState } from './InsightCard';

/** Symptom-by-phase patterns, described from the user's own logs only. */
export function SymptomPatternCard({ insights }: { insights: SymptomInsight[] }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  if (insights.length === 0) {
    return (
      <InsightCard title="Symptom patterns">
        <InsightEmptyState message="Keep logging symptoms across a few cycles and we’ll spot patterns by cycle phase." />
      </InsightCard>
    );
  }

  return (
    <InsightCard title="Symptom patterns">
      <View style={styles.list}>
        {insights.map((insight) => {
          const share = insight.occurrences / insight.total;
          return (
            <View key={insight.symptom_code} style={styles.item}>
              <Text style={[typography.body, { color: c.text }]}>
                You logged <Text style={styles.bold}>{insight.label.toLowerCase()}</Text> most often
                in your <Text style={styles.bold}>{PHASE_LABELS[insight.phase]}</Text> phase (
                {insight.occurrences} of {insight.total} times).
              </Text>
              <View style={[styles.bar, { backgroundColor: c.border }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.round(share * 100)}%`, backgroundColor: c.primary },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
      <Text style={[typography.caption, { color: c.textMuted }]}>
        These describe your own logs, not a diagnosis.
      </Text>
    </InsightCard>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  item: {
    gap: spacing.sm,
  },
  bold: {
    fontWeight: '700',
  },
  bar: {
    height: 8,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: radius.full,
  },
});
