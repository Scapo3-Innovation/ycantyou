import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/theme';
import type { RiskBand } from '@/types/database';

import { RISK_BAND_BLURB, RISK_BAND_LABEL } from '../constants';

/** Shows the risk band as a likelihood indication (never a diagnosis). */
export function RiskBandIndicator({ band }: { band: RiskBand }) {
  const bandColor: Record<RiskBand, string> = {
    low: colors.success,
    moderate: colors.warning,
    high: colors.danger,
  };

  return (
    <Card>
      <Text style={[typography.caption, styles.eyebrow, { color: colors.textMuted }]}>
        Your screening indication
      </Text>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: bandColor[band] }]} />
        <Text style={[typography.h1, { color: colors.text }]}>{RISK_BAND_LABEL[band]}</Text>
      </View>
      <Text style={[typography.body, { color: colors.textMuted }]}>{RISK_BAND_BLURB[band]}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
  },
});
