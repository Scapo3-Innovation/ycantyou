import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
};

/** Pill chip — static (label) or selectable (onPress). Used for flow levels, filters, tags. */
export function Chip({ label, selected = false, onPress, leftIcon }: ChipProps) {
  const body = (
    <>
      {leftIcon ? (
        <Ionicons
          name={leftIcon}
          size={14}
          color={selected ? colors.primaryText : colors.textMuted}
        />
      ) : null}
      <Text
        style={[typography.caption, { color: selected ? colors.primaryText : colors.text }]}>
        {label}
      </Text>
    </>
  );

  const style = [
    styles.chip,
    {
      backgroundColor: selected ? colors.primary : colors.surfaceAlt,
      borderColor: selected ? colors.primary : colors.border,
    },
  ];

  if (!onPress) {
    return <View style={style}>{body}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={style}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
});
