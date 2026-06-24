import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Checkbox } from '@/components/ui/Checkbox';
import { colors, spacing, typography } from '@/theme';
import type { Symptom } from '@/types/database';

type SymptomMultiSelectProps = {
  symptoms: Symptom[];
  selected: string[];
  onChange: (codes: string[]) => void;
};

/** Multi-select symptom checklist, grouped by category, backed by the symptoms lookup. */
export function SymptomMultiSelect({ symptoms, selected, onChange }: SymptomMultiSelectProps) {
  const c = colors;
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
      <Text style={[typography.caption, styles.label, { color: c.textMuted }]}>Symptoms</Text>
      {groups.map(([category, items]) => (
        <View key={category} style={styles.group}>
          <Text style={[typography.caption, styles.category, { color: c.textMuted }]}>
            {category.replace(/_/g, ' ')}
          </Text>
          {items.map((symptom) => (
            <Checkbox
              key={symptom.code}
              checked={selectedSet.has(symptom.code)}
              onChange={() => toggle(symptom.code)}
              label={symptom.label}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  label: {
    fontWeight: '600',
  },
  group: {
    gap: spacing.sm,
  },
  category: {
    textTransform: 'capitalize',
  },
});
