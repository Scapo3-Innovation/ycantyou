import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { PHASE_LABELS } from '../constants';
import type { SymptomInsight } from '../types';
import { InsightCard, InsightEmptyState } from './InsightCard';

function hapticTap() {
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

/** Symptom patterns — tappable chips with a detail panel for the selected one. */
export function SymptomPatternCard({
  insights,
  compact = false,
  embedded = false,
}: {
  insights: SymptomInsight[];
  compact?: boolean;
  embedded?: boolean;
}) {
  const c = colors;
  const [selectedCode, setSelectedCode] = useState<string | null>(insights[0]?.symptom_code ?? null);
  const selected = insights.find((entry) => entry.symptom_code === selectedCode) ?? insights[0];

  if (insights.length === 0) {
    return (
      <InsightCard title="Symptom patterns" compact={compact} embedded={embedded}>
        <InsightEmptyState message="Log symptoms across a few cycles to see phase patterns." />
      </InsightCard>
    );
  }

  return (
    <InsightCard title="Symptom patterns" compact={compact} embedded={embedded}>
      <View style={styles.chips}>
        {insights.map((insight) => {
          const active = insight.symptom_code === selected?.symptom_code;
          const share = insight.occurrences / insight.total;
          return (
            <Pressable
              key={insight.symptom_code}
              onPress={() => {
                hapticTap();
                setSelectedCode(insight.symptom_code);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && styles.pressed,
              ]}>
              <Text
                style={[
                  typography.captionMedium,
                  { color: active ? colors.primary : colors.text },
                ]}>
                {insight.label}
              </Text>
              <View style={[styles.chipBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.chipBarFill,
                    {
                      width: `${Math.round(share * 100)}%`,
                      backgroundColor: active ? colors.primary : colors.secondary,
                    },
                  ]}
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      {selected ? (
        <View style={[styles.detail, { backgroundColor: colors.surfaceAlt }]}>
          <View style={styles.detailHeader}>
            <Ionicons name="analytics-outline" size={16} color={colors.secondary} />
            <Text style={[typography.bodyMedium, { color: c.text }]}>{selected.label}</Text>
          </View>
          <Text style={[typography.caption, { color: c.textMuted }]}>
            Most often in your <Text style={styles.bold}>{PHASE_LABELS[selected.phase]}</Text> phase
          </Text>
          <View style={styles.statRow}>
            <StatPill label="Logged" value={`${selected.occurrences}/${selected.total}`} />
            <StatPill
              label="Phase share"
              value={`${Math.round((selected.occurrences / selected.total) * 100)}%`}
            />
          </View>
        </View>
      ) : null}
    </InsightCard>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[typography.bodyMedium, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minWidth: '30%',
    flexGrow: 1,
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.roseTint,
  },
  chipBar: {
    height: 4,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  chipBarFill: {
    height: 4,
    borderRadius: radius.full,
  },
  detail: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 2,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  pressed: {
    opacity: 0.9,
  },
});
