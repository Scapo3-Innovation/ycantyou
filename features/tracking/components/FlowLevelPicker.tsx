import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { FlowLevel } from '@/types/database';

import { FLOW_LEVELS } from '../constants';

type FlowLevelPickerProps = {
  value: FlowLevel | null;
  onChange: (value: FlowLevel | null) => void;
};

/** Horizontal chips for period flow. Tapping the selected chip clears it. */
export function FlowLevelPicker({ value, onChange }: FlowLevelPickerProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, styles.label, { color: c.textMuted }]}>Period flow</Text>
      <View style={styles.row}>
        {FLOW_LEVELS.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(selected ? null : option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? c.primary : c.surface,
                  borderColor: selected ? c.primary : c.border,
                },
              ]}>
              <Text style={[typography.caption, { color: selected ? c.primaryText : c.text }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
});
