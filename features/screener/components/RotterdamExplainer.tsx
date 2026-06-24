import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { ROTTERDAM_INTRO, ROTTERDAM_OUTRO, ROTTERDAM_POINTS } from '../constants';

/** Plain-language explainer of how PCOS is actually diagnosed (education, not diagnosis). */
export function RotterdamExplainer() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];
  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[typography.heading, { color: c.text }]}>How PCOS is diagnosed</Text>
      <Text style={[typography.body, { color: c.textMuted }]}>{ROTTERDAM_INTRO}</Text>
      <View style={styles.points}>
        {ROTTERDAM_POINTS.map((point, i) => (
          <View key={point} style={styles.point}>
            <Text style={[typography.body, { color: c.primary }]}>{i + 1}.</Text>
            <Text style={[typography.body, styles.pointText, { color: c.text }]}>{point}</Text>
          </View>
        ))}
      </View>
      <Text style={[typography.caption, { color: c.textMuted }]}>{ROTTERDAM_OUTRO}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  points: {
    gap: spacing.sm,
  },
  point: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pointText: {
    flex: 1,
  },
});
