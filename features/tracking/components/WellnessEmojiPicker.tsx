import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { WellnessOption } from '@/features/tracking/constants';
import { colors, radius, spacing, typography } from '@/theme';

type WellnessEmojiPickerProps = {
  label: string;
  options: readonly WellnessOption[];
  value: number | null;
  onChange: (value: number | null) => void;
};

function hapticTap() {
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

/** Icon-based 1–5 picker for mood and energy. Tap again to clear. */
export function WellnessEmojiPicker({ label, options, value, onChange }: WellnessEmojiPickerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={[typography.bodyMedium, styles.fieldLabel, { color: colors.text }]}>
        {label}
      </Text>
      <View style={styles.row}>
        {options.map((option) => {
          const active = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                hapticTap();
                onChange(active ? null : option.value);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${option.label}`}
              accessibilityState={{ selected: active }}
              style={styles.item}>
              <View
                style={[
                  styles.orb,
                  active && {
                    borderColor: option.ring,
                    borderWidth: 2,
                    backgroundColor: colors.roseTint,
                  },
                ]}>
                <Ionicons
                  name={option.icon}
                  size={22}
                  color={active ? option.iconColor : colors.textMuted}
                />
              </View>
              <Text
                style={[
                  active ? typography.captionMedium : typography.caption,
                  styles.optionLabel,
                  { color: active ? colors.text : colors.textMuted },
                ]}
                numberOfLines={2}>
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
  wrap: {
    gap: spacing.sm,
  },
  fieldLabel: {
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
