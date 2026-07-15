import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { ListItem } from '@/components/ui/ListItem';
import { RISK_BAND_LABEL } from '@/features/screener/constants';
import type { ScreenerResult } from '@/types/database';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { StyleSheet, Text, View } from 'react-native';

type HomeQuickLinksProps = {
  lastScreener: ScreenerResult | undefined;
  logsThisWeek: number;
  onCalendar: () => void;
  onCommunity: () => void;
  onScreener: () => void;
  onScreenerHistory: () => void;
};

/** Shortcuts to the rest of the app plus a weekly logging nudge. */
export function HomeQuickLinks({
  lastScreener,
  logsThisWeek,
  onCalendar,
  onCommunity,
  onScreener,
  onScreenerHistory,
}: HomeQuickLinksProps) {
  return (
    <View style={styles.wrap}>
      <Text style={[typography.captionMedium, styles.sectionLabel, { color: colors.textMuted }]}>
        Explore
      </Text>

      <View style={styles.weekBanner}>
        <Text style={[typography.bodyMedium, { color: colors.text }]}>
          {logsThisWeek === 0
            ? 'No logs this week yet'
            : `${logsThisWeek} day${logsThisWeek === 1 ? '' : 's'} logged this week`}
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Small check-ins build the clearest picture over time.
        </Text>
      </View>

      <Card style={styles.card}>
        <ListItem
          title="Full calendar"
          subtitle="Period history, fertile window, reminders"
          leftIcon="calendar-outline"
          onPress={onCalendar}
        />
        <Divider />
        <ListItem
          title="Community"
          subtitle="Ask doubts and share feelings — optional anonymity"
          leftIcon="people-outline"
          onPress={onCommunity}
        />
        <Divider />
        <ListItem
          title="PCOS screener"
          subtitle={
            lastScreener
              ? `Last result: ${RISK_BAND_LABEL[lastScreener.risk_band]} — not a diagnosis`
              : 'Screening tool — not a diagnosis'
          }
          leftIcon="clipboard-outline"
          onPress={lastScreener ? onScreenerHistory : onScreener}
        />
      </Card>
    </View>
  );
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
  weekBanner: {
    backgroundColor: '#EDE8F5',
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
});
