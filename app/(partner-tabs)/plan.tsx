import { addDays, format, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { analyseTripRange } from '@/features/partner/insights/tripPlanner';
import { usePartnerCalendarRange } from '@/features/partner/usePartnerDashboard';
import { FertileWindowNote } from '@/features/tracking/components/FertileWindowNote';
import { colors, radius, spacing, typography } from '@/theme';

const PRESETS = [
  { id: 'weekend', label: 'This weekend', days: 2 },
  { id: 'week', label: 'Next 7 days', days: 7 },
  { id: 'trip', label: 'Two-week trip', days: 14 },
] as const;

export default function PartnerPlanScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));

  const { data: calendar, isLoading } = usePartnerCalendarRange(start, end, true);

  const analysis = useMemo(() => {
    if (!calendar) return null;
    return analyseTripRange(start, end, calendar);
  }, [calendar, start, end]);

  const hasFertile = (calendar?.marks ?? []).some((m) => m.kind === 'fertile');

  function applyPreset(days: number) {
    setStart(today);
    setEnd(format(addDays(parseISO(today), days), 'yyyy-MM-dd'));
  }

  function shiftRange(delta: number) {
    setStart(format(addDays(parseISO(start), delta), 'yyyy-MM-dd'));
    setEnd(format(addDays(parseISO(end), delta), 'yyyy-MM-dd'));
  }

  return (
    <Screen>
      <ScreenHeader title="Plan" subtitle="Trips, dates, and events" />

      <ScrollView contentContainerStyle={[styles.scroll, screenBodyPadding]}>
        <Card>
          <Text style={[typography.captionMedium, { color: colors.textMuted }]}>DATE RANGE</Text>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>
            {format(parseISO(start), 'd MMM yyyy')} – {format(parseISO(end), 'd MMM yyyy')}
          </Text>
          <View style={styles.shiftRow}>
            <Pressable onPress={() => shiftRange(-7)} style={styles.shiftBtn}>
              <Text style={[typography.captionMedium, { color: colors.secondary }]}>← Week</Text>
            </Pressable>
            <Pressable onPress={() => shiftRange(7)} style={styles.shiftBtn}>
              <Text style={[typography.captionMedium, { color: colors.secondary }]}>Week →</Text>
            </Pressable>
          </View>
          <View style={styles.presetRow}>
            {PRESETS.map((preset) => (
              <Pressable
                key={preset.id}
                onPress={() => applyPreset(preset.days)}
                style={[styles.presetChip, { borderColor: colors.border }]}>
                <Text style={[typography.captionMedium, { color: colors.text }]}>{preset.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {isLoading ? (
          <ActivityIndicator color={colors.secondary} />
        ) : analysis ? (
          <>
            {analysis.insights.map((insight) => (
              <Card
                key={insight.id}
                style={
                  insight.severity === 'warning'
                    ? { borderColor: colors.warning }
                    : undefined
                }>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{insight.title}</Text>
                <Text style={[typography.body, { color: colors.textMuted }]}>{insight.body}</Text>
              </Card>
            ))}

            <Card>
              <Text style={[typography.captionMedium, { color: colors.textMuted }]}>
                SUGGESTIONS
              </Text>
              <Text style={[typography.body, { color: colors.text }]}>
                Outdoor trips and active dates work best outside period or low-energy days. Romantic
                dinners anytime — ask what she feels like that week.
              </Text>
            </Card>
          </>
        ) : null}

        {hasFertile ? <FertileWindowNote /> : null}

        <Button label="Refresh" variant="secondary" onPress={() => applyPreset(7)} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  shiftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shiftBtn: {
    paddingVertical: spacing.sm,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetChip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
