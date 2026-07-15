import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/theme';

import type { PartnerSupportTip } from '../insights/supportTips';

type PartnerSupportCardProps = {
  tip: PartnerSupportTip;
};

const TONE_COLORS: Record<PartnerSupportTip['tone'], string> = {
  support: colors.roseTint,
  heads_up: colors.tealTint,
  wellness: '#F5E6FF',
  education: colors.surface,
};

export function PartnerSupportCard({ tip }: PartnerSupportCardProps) {
  return (
    <Card style={[styles.card, { backgroundColor: TONE_COLORS[tip.tone] }]}>
      <Text style={[typography.bodyMedium, { color: colors.text }]}>{tip.title}</Text>
      <Text style={[typography.body, { color: colors.textMuted }]}>{tip.body}</Text>
    </Card>
  );
}

type PartnerHeroProps = {
  primaryName: string;
  cycleLabel: string | null;
};

export function PartnerHero({ primaryName, cycleLabel }: PartnerHeroProps) {
  return (
    <View style={styles.hero}>
      <Text style={[typography.captionMedium, { color: colors.textMuted }]}>
        SUPPORTING
      </Text>
      <Text style={[typography.h1, { color: colors.text }]}>{primaryName}</Text>
      {cycleLabel ? (
        <View style={[styles.badge, { backgroundColor: colors.roseTint }]}>
          <Text style={[typography.bodyMedium, { color: colors.primary }]}>{cycleLabel}</Text>
        </View>
      ) : (
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Cycle details appear when she shares them.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  card: {
    gap: spacing.sm,
  },
});
