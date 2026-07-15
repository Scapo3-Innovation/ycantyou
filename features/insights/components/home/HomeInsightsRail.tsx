import { format, parseISO } from 'date-fns';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { IRREGULAR_SPREAD_DAYS } from '@/features/tracking/constants';
import { colors, radius, spacing, typography } from '@/theme';

import { MIN_CYCLES_FOR_TREND, PHASE_LABELS } from '../../constants';
import type { CycleLengthStats, SymptomInsight } from '../../types';
import type { DailyLog } from '@/types/database';

type Tile = {
  id: string;
  title: string;
  body: string;
  cta: string;
  onPress: () => void;
};

type HomeInsightsRailProps = {
  selectedDate: string;
  stats: CycleLengthStats | undefined;
  insights: SymptomInsight[];
  recentLog: DailyLog | undefined;
  logsThisWeek: number;
  onCycleInsight: () => void;
  onSymptomInsight: () => void;
  onScreener: () => void;
  onRecentLog: () => void;
};

function buildTiles({
  selectedDate,
  stats,
  insights,
  recentLog,
  logsThisWeek,
  onCycleInsight,
  onSymptomInsight,
  onScreener,
  onRecentLog,
}: HomeInsightsRailProps): Tile[] {
  const dateLabel = format(parseISO(selectedDate), 'd MMM');
  const tiles: Tile[] = [];

  const enough =
    stats &&
    stats.n_cycles >= MIN_CYCLES_FOR_TREND &&
    stats.avg_length != null &&
    stats.spread != null;

  if (enough) {
    const regular = stats.spread! <= IRREGULAR_SPREAD_DAYS;
    tiles.push({
      id: 'cycle',
      title: `Cycle · ${dateLabel}`,
      body: `Average ${stats.avg_length} days · ${regular ? 'fairly regular' : 'irregular'}`,
      cta: 'View trend',
      onPress: onCycleInsight,
    });
  } else {
    tiles.push({
      id: 'cycle-empty',
      title: `Insights · ${dateLabel}`,
      body: 'Log two periods to unlock your cycle-length trend.',
      cta: 'Log period',
      onPress: onCycleInsight,
    });
  }

  tiles.push({
    id: 'week',
    title: 'This week',
    body:
      logsThisWeek === 0
        ? 'Start a logging streak — even one entry helps.'
        : `${logsThisWeek} day${logsThisWeek === 1 ? '' : 's'} logged so far.`,
    cta: logsThisWeek === 0 ? 'Log today' : 'Keep going',
    onPress: onRecentLog,
  });

  if (insights[0]) {
    const s = insights[0];
    tiles.push({
      id: 'symptom',
      title: 'Symptom pattern',
      body: `${s.label} often appears in your ${PHASE_LABELS[s.phase]} phase`,
      cta: 'See more',
      onPress: onSymptomInsight,
    });
  }

  tiles.push({
    id: 'screener',
    title: 'PCOS screener',
    body: 'A short checklist to discuss with a clinician — not a diagnosis.',
    cta: 'Start',
    onPress: onScreener,
  });

  if (recentLog) {
    tiles.push({
      id: 'recent',
      title: 'Last log',
      body: format(parseISO(recentLog.log_date), 'EEE d MMM'),
      cta: 'Open log',
      onPress: onRecentLog,
    });
  }

  return tiles;
}

/** Horizontal insight cards — reference-style daily insights rail. */
export function HomeInsightsRail(props: HomeInsightsRailProps) {
  const tiles = buildTiles(props);
  const headerDate = format(parseISO(props.selectedDate), 'd MMM');

  return (
    <View style={styles.wrap}>
      <Text style={[typography.caption, styles.header, { color: colors.textMuted }]}>
        My daily insights · {headerDate}
      </Text>
      <FlatList
        data={tiles}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={item.onPress}
            accessibilityRole="button"
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <View style={[styles.cardTop, { backgroundColor: colors.roseTint }]}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.title}</Text>
              <Text style={[typography.caption, styles.body, { color: colors.textMuted }]}>
                {item.body}
              </Text>
            </View>
            <View style={styles.cardBottom}>
              <Text style={[typography.caption, styles.cta, { color: colors.primary }]}>
                {item.cta}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  header: {
    paddingHorizontal: spacing.xl,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: 200,
    marginRight: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  cardTop: {
    padding: spacing.md,
    minHeight: 100,
    gap: spacing.xs,
  },
  body: {
    lineHeight: 18,
  },
  cardBottom: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  cta: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.92,
  },
});
