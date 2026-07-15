import { format, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { Card } from '@/components/ui/Card';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import {
  buildPartnerMarkedDates,
  monthRange,
} from '@/features/partner/partnerCalendar';
import { usePartnerCalendarRange } from '@/features/partner/usePartnerDashboard';
import { FertileWindowNote } from '@/features/tracking/components/FertileWindowNote';
import { colors, spacing, typography } from '@/theme';

export default function PartnerCalendarScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [visibleMonth, setVisibleMonth] = useState(today);
  const month = parseISO(visibleMonth);
  const { start, end } = monthRange(month.getFullYear(), month.getMonth() + 1);

  const { data, isLoading } = usePartnerCalendarRange(start, end, true);

  const markedDates = useMemo(
    () => buildPartnerMarkedDates(data?.marks ?? []),
    [data?.marks],
  );

  const hasFertile = (data?.marks ?? []).some((m) => m.kind === 'fertile');

  return (
    <Screen>
      <ScreenHeader title="Calendar" subtitle="What she chooses to share" />

      <ScrollView contentContainerStyle={[styles.scroll, screenBodyPadding]}>
        {isLoading ? (
          <ActivityIndicator color={colors.secondary} />
        ) : (
          <Card style={styles.calendarCard}>
            <Calendar
              current={visibleMonth}
              onMonthChange={(m) => setVisibleMonth(m.dateString)}
              markedDates={markedDates}
              markingType="custom"
              theme={{
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.textMuted,
                dayTextColor: colors.text,
                todayTextColor: colors.secondary,
                arrowColor: colors.secondary,
              }}
            />
            <View style={styles.legend}>
              <LegendDot color={colors.roseTint} label="Period" />
              <LegendDot color="#FFF5F8" label="Next period (est.)" />
              {hasFertile ? <LegendDot color={colors.tealTint} label="Fertile (est.)" /> : null}
            </View>
          </Card>
        )}

        {data?.prediction_status === 'irregular' ? (
          <Text style={[typography.caption, { color: colors.warning }]}>
            Her cycles vary — calendar estimates may shift. Keep plans flexible.
          </Text>
        ) : null}

        {hasFertile ? <FertileWindowNote /> : null}
      </ScrollView>
    </Screen>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  calendarCard: {
    padding: spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
