import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type RangeBarProps = {
  min: number;
  max: number;
  avg: number;
  unit?: string;
};

/**
 * Lightweight min–avg–max visual built from plain Views (no chart library).
 * Shows the range as a track with a marker at the average.
 */
export function RangeBar({ min, max, avg, unit = 'days' }: RangeBarProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  const span = max - min;
  const fraction = span > 0 ? (avg - min) / span : 0.5;
  const markerLeft = `${Math.min(100, Math.max(0, fraction * 100))}%` as const;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: c.border }]}>
        <View style={[styles.marker, { left: markerLeft, backgroundColor: c.primary }]} />
      </View>
      <View style={styles.labels}>
        <Text style={[typography.caption, { color: c.textMuted }]}>
          {min} {unit}
        </Text>
        <Text style={[typography.caption, { color: c.text, fontWeight: '600' }]}>
          avg {avg}
        </Text>
        <Text style={[typography.caption, { color: c.textMuted }]}>
          {max} {unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    justifyContent: 'center',
  },
  marker: {
    position: 'absolute',
    width: 3,
    height: 16,
    borderRadius: radius.sm,
    marginLeft: -1.5,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
