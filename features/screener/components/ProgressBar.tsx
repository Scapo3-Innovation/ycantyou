import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type ProgressBarProps = {
  current: number; // 1-based
  total: number;
};

/** "Question X of Y" with a filled progress track. */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const c = colors;
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, { color: c.textMuted }]}>
        Question {current} of {total}
      </Text>
      <View style={[styles.track, { backgroundColor: c.border }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: c.primary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: radius.full,
  },
});
