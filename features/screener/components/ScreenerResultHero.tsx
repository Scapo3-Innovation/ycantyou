import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { DISCLAIMER_SHORT, REFERRAL, RISK_BAND_BLURB, RISK_BAND_LABEL } from '@/features/screener/constants';
import { colors, radius, spacing, typography } from '@/theme';
import type { RiskBand } from '@/types/database';

const BAND_THEME: Record<
  RiskBand,
  {
    background: string;
    accent: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  low: {
    background: colors.tealTint,
    accent: colors.success,
    icon: 'checkmark-circle-outline',
  },
  moderate: {
    background: '#FFF6EB',
    accent: colors.warning,
    icon: 'alert-circle-outline',
  },
  high: {
    background: colors.roseTint,
    accent: colors.primary,
    icon: 'pulse-outline',
  },
};

function resolveBand(band: string): RiskBand {
  if (band === 'low' || band === 'moderate' || band === 'high') return band;
  return 'moderate';
}

type ScreenerResultHeroProps = {
  band: RiskBand | string;
  score: number;
};

export function ScreenerResultHero({ band, score }: ScreenerResultHeroProps) {
  const resolved = resolveBand(band);
  const theme = BAND_THEME[resolved];
  const safeScore = Number.isFinite(score) ? Math.round(score) : 0;

  return (
    <View style={styles.wrap}>
      <View style={[styles.hero, { backgroundColor: theme.background }]}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
          <Ionicons name={theme.icon} size={28} color={theme.accent} />
        </View>

        <Text style={[typography.captionMedium, styles.eyebrow, { color: colors.textMuted }]}>
          Your screening indication
        </Text>
        <Text style={[typography.display, styles.bandLabel, { color: colors.text }]}>
          {RISK_BAND_LABEL[resolved]}
        </Text>
        <Text style={[typography.body, styles.blurb, { color: colors.textMuted }]}>
          {RISK_BAND_BLURB[resolved]}
        </Text>

        <View style={[styles.scorePill, { borderColor: theme.accent }]}>
          <Text style={[typography.captionMedium, { color: theme.accent }]}>
            Score {safeScore} — screening only
          </Text>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="medkit-outline" size={20} color={colors.secondary} />
        <View style={styles.disclaimerCopy}>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>
            {DISCLAIMER_SHORT}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{REFERRAL}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.lg,
  },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bandLabel: {
    textAlign: 'center',
  },
  blurb: {
    textAlign: 'center',
    maxWidth: 320,
  },
  scorePill: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  disclaimerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
});
