import { StyleSheet, Text, View } from 'react-native';

import { ROTTERDAM_INTRO, ROTTERDAM_OUTRO, ROTTERDAM_POINTS } from '@/features/screener/constants';
import { colors, radius, spacing, typography } from '@/theme';

/** Plain-language explainer of how PCOS is diagnosed (education, not diagnosis). */
export function RotterdamExplainer() {
  return (
    <View style={styles.wrap}>
      <Text style={[typography.h2, { color: colors.text }]}>How PCOS is diagnosed</Text>
      <Text style={[typography.body, { color: colors.textMuted }]}>{ROTTERDAM_INTRO}</Text>

      <View style={styles.points}>
        {ROTTERDAM_POINTS.map((point, index) => (
          <View key={point} style={styles.point}>
            <View style={styles.bullet}>
              <Text style={[typography.captionMedium, { color: colors.secondary }]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[typography.body, styles.pointText, { color: colors.text }]}>{point}</Text>
          </View>
        ))}
      </View>

      <Text style={[typography.caption, styles.outro, { color: colors.textMuted }]}>
        {ROTTERDAM_OUTRO}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  points: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  bullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pointText: {
    flex: 1,
  },
  outro: {
    paddingTop: spacing.xs,
  },
});
