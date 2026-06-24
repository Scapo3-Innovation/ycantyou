import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { colors, spacing, typography } from '@/theme';
import type { FlowLevel } from '@/types/database';

import { FLOW_LEVELS } from '../constants';

type FlowLevelPickerProps = {
  value: FlowLevel | null;
  onChange: (value: FlowLevel | null) => void;
};

/** Horizontal chips for period flow. Tapping the selected chip clears it. */
export function FlowLevelPicker({ value, onChange }: FlowLevelPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={[typography.caption, styles.label, { color: colors.textMuted }]}>
        Period flow
      </Text>
      <View style={styles.row}>
        {FLOW_LEVELS.map((option) => {
          const selected = option.value === value;
          return (
            <Chip
              key={option.value}
              label={option.label}
              selected={selected}
              onPress={() => onChange(selected ? null : option.value)}
            />
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
});
