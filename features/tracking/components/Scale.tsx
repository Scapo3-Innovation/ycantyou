import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { SCALE_LABELS } from '../constants';

type ScaleProps = {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
};

/** A 1–5 selector used for mood and energy. Tapping the current value clears it. */
export function Scale({ label, value, onChange }: ScaleProps) {
  const c = colors;

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, styles.label, { color: c.textMuted }]}>{label}</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${label}: ${n}, ${SCALE_LABELS[n]}`}
              style={[
                styles.dot,
                {
                  backgroundColor: selected ? c.primary : c.surface,
                  borderColor: selected ? c.primary : c.border,
                },
              ]}>
              <Text
                style={[
                  typography.body,
                  { color: selected ? c.primaryText : c.text, fontWeight: '600' },
                ]}>
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {value ? (
        <Text style={[typography.caption, { color: c.textMuted }]}>{SCALE_LABELS[value]}</Text>
      ) : null}
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
    gap: spacing.sm,
  },
  dot: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
