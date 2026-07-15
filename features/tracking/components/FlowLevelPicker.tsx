import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { FlowLevel } from '@/types/database';

import { FLOW_LEVELS } from '../constants';

type FlowLevelPickerProps = {
  value: FlowLevel | null;
  onChange: (value: FlowLevel | null) => void;
  hideLabel?: boolean;
};

function hapticTap() {
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

/** Icon row for period flow — droplet icons women recognise from cycle tracking. */
export function FlowLevelPicker({ value, onChange, hideLabel = false }: FlowLevelPickerProps) {
  return (
    <View style={styles.container}>
      {hideLabel ? null : (
        <Text style={[typography.bodyMedium, styles.label, { color: colors.text }]}>
          Period flow
        </Text>
      )}
      <View style={styles.row}>
        {FLOW_LEVELS.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                hapticTap();
                onChange(selected ? null : option.value);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Flow: ${option.label}`}
              accessibilityState={{ selected }}
              style={styles.item}>
              <View
                style={[
                  styles.orb,
                  selected && {
                    borderColor: option.ring,
                    borderWidth: 2,
                    backgroundColor:
                      option.value === 'none' ? colors.surfaceAlt : colors.roseTint,
                  },
                ]}>
                <Ionicons
                  name={option.icon}
                  size={option.value === 'spotting' ? 14 : 22}
                  color={selected ? option.iconColor : colors.textMuted}
                />
              </View>
              <Text
                style={[
                  selected ? typography.captionMedium : typography.caption,
                  styles.optionLabel,
                  { color: selected ? colors.text : colors.textMuted },
                ]}
                numberOfLines={1}>
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  label: {
    paddingHorizontal: spacing.xs,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 0,
  },
  orb: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
});
