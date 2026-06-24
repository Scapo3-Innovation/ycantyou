import { format, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import type { CyclePrediction } from '@/features/tracking/prediction';
import { colors, radius, spacing, typography } from '@/theme';

type HomeForecastCardsProps = {
  prediction: CyclePrediction;
};

/** Next period / fertile-window estimates — honest labels, not contraception. */
export function HomeForecastCards({ prediction }: HomeForecastCardsProps) {
  const cards = buildCards(prediction);
  if (cards.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[typography.captionMedium, styles.sectionLabel, { color: colors.textMuted }]}>
        Coming up
      </Text>
      <View style={styles.row}>
        {cards.map((card) => (
          <View key={card.id} style={[styles.card, { backgroundColor: card.bg }]}>
            <Text style={[typography.captionMedium, { color: colors.text }]}>{card.title}</Text>
            <Text style={[typography.bodyMedium, styles.value, { color: colors.text }]}>
              {card.value}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{card.hint}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

type ForecastCard = {
  id: string;
  title: string;
  value: string;
  hint: string;
  bg: string;
};

function buildCards(prediction: CyclePrediction): ForecastCard[] {
  if (prediction.status === 'insufficient') {
    return [
      {
        id: 'period',
        title: 'Next period',
        value: '—',
        hint: 'Log two period starts for an estimate.',
        bg: '#FCE8EF',
      },
    ];
  }

  if (prediction.status === 'irregular') {
    return [
      {
        id: 'period',
        title: 'Cycle length',
        value: `~${prediction.avgLength} days`,
        hint: 'Your cycles vary — we will not pin an exact date.',
        bg: '#FCE8EF',
      },
    ];
  }

  const cards: ForecastCard[] = [
    {
      id: 'period',
      title: 'Next period',
      value: format(parseISO(prediction.predictedStart), 'd MMM'),
      hint: `Window ${format(parseISO(prediction.windowStart), 'd MMM')} – ${format(parseISO(prediction.windowEnd), 'd MMM')}`,
      bg: '#FCE8EF',
    },
  ];

  if (prediction.fertile) {
    cards.push({
      id: 'fertile',
      title: 'Fertile window',
      value: `${format(parseISO(prediction.fertile.start), 'd MMM')} – ${format(parseISO(prediction.fertile.end), 'd MMM')}`,
      hint: 'Estimate only — not contraception.',
      bg: '#E8F5F2',
    });
  }

  return cards;
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 108,
  },
  value: {
    fontSize: 18,
  },
});
