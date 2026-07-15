import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { PARTNER_LEARN_CARDS } from '@/features/partner/partnerLearnContent';
import { colors, spacing, typography } from '@/theme';

const CATEGORY_LABELS: Record<string, string> = {
  phase: 'Cycle phases',
  support: 'Practical support',
  pcos: 'PCOS basics',
  communication: 'Communication',
};

export default function PartnerLearnScreen() {
  const categories = ['phase', 'communication', 'support', 'pcos'] as const;

  return (
    <Screen>
      <ScreenHeader title="Learn" subtitle="Support her with empathy" />

      <ScrollView contentContainerStyle={[styles.scroll, screenBodyPadding]}>
        {categories.map((category) => {
          const cards = PARTNER_LEARN_CARDS.filter((c) => c.category === category);
          if (cards.length === 0) return null;

          return (
            <View key={category} style={styles.section}>
              <Text style={[typography.captionMedium, styles.sectionLabel, { color: colors.textMuted }]}>
                {CATEGORY_LABELS[category]}
              </Text>
              {cards.map((card) => (
                <Card key={card.id}>
                  <Text style={[typography.bodyMedium, { color: colors.text }]}>{card.title}</Text>
                  <Text style={[typography.body, { color: colors.textMuted }]}>{card.body}</Text>
                </Card>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
