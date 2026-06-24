import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { RiskBand } from '@/types/database';

import { RISK_BAND_BLURB, RISK_BAND_LABEL } from '../constants';

/** Shows the risk band as a likelihood indication (never a diagnosis). */
export function RiskBandIndicator({ band }: { band: RiskBand }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];
  const bandColor: Record<RiskBand, string> = {
    low: c.success,
    moderate: c.warning,
    high: c.danger,
  };

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[typography.caption, styles.eyebrow, { color: c.textMuted }]}>
        Your screening indication
      </Text>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: bandColor[band] }]} />
        <Text style={[typography.title, { color: c.text }]}>{RISK_BAND_LABEL[band]}</Text>
      </View>
      <Text style={[typography.body, { color: c.textMuted }]}>{RISK_BAND_BLURB[band]}</Text>
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
