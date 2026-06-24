import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/theme';

import { ROTTERDAM_INTRO, ROTTERDAM_OUTRO, ROTTERDAM_POINTS } from '../constants';

/** Plain-language explainer of how PCOS is actually diagnosed (education, not diagnosis). */
export function RotterdamExplainer() {
  return (
    <Card>
      <Text style={[typography.h2, { color: colors.text }]}>How PCOS is diagnosed</Text>
      <Text style={[typography.body, { color: colors.textMuted }]}>{ROTTERDAM_INTRO}</Text>
      <View style={styles.points}>
        {ROTTERDAM_POINTS.map((point, i) => (
          <View key={point} style={styles.point}>
            <Text style={[typography.body, { color: colors.primary }]}>{i + 1}.</Text>
            <Text style={[typography.body, styles.pointText, { color: colors.text }]}>{point}</Text>
          </View>
        ))}
      </View>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{ROTTERDAM_OUTRO}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
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
