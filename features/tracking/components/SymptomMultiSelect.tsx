import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { Symptom } from '@/types/database';

type SymptomMultiSelectProps = {
  symptoms: Symptom[];
  selected: string[];
  onChange: (codes: string[]) => void;
  hideLabel?: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  skin: 'Skin',
  hair: 'Hair & body',
  digestive: 'Digestive',
  energy: 'Energy',
  mood: 'Mood',
  cycle: 'Cycle',
  sexual_health: 'Sexual health',
  other: 'Other',
};

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, ' ');
}

/** Symptom picker — grouped chips in a compact two-column layout. */
export function SymptomMultiSelect({
  symptoms,
  selected,
  onChange,
  hideLabel = false,
}: SymptomMultiSelectProps) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const groups = useMemo(() => {
    const byCategory = new Map<string, Symptom[]>();
    for (const symptom of symptoms) {
      const key = symptom.category ?? 'other';
      const list = byCategory.get(key) ?? [];
      list.push(symptom);
      byCategory.set(key, list);
    }
    return [...byCategory.entries()];
  }, [symptoms]);

  function toggle(code: string) {
    const next = new Set(selectedSet);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    onChange([...next]);
  }

  return (
    <View style={styles.container}>
      {hideLabel ? null : (
        <Text style={[typography.bodyMedium, styles.label, { color: colors.text }]}>
          Symptoms
        </Text>
      )}
      {groups.map(([category, items]) => (
        <View key={category} style={styles.group}>
          <Text style={[typography.captionMedium, styles.category, { color: colors.textMuted }]}>
            {categoryLabel(category)}
          </Text>
          <View style={styles.chipGrid}>
            {items.map((symptom) => {
              const active = selectedSet.has(symptom.code);
              return (
                <Pressable
                  key={symptom.code}
                  onPress={() => toggle(symptom.code)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={symptom.label}
                  style={({ pressed }) => [
                    styles.chip,
                    active && styles.chipActive,
                    pressed && styles.pressed,
                  ]}>
                  <Text
                    style={[
                      typography.captionMedium,
                      styles.chipLabel,
                      { color: active ? colors.primary : colors.text },
                    ]}>
                    {symptom.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  label: {
    paddingHorizontal: spacing.xs,
  },
  group: {
    gap: spacing.sm,
  },
  category: {
    paddingHorizontal: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    width: '48%',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.roseTint,
  },
  chipLabel: {
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.9,
  },
});
