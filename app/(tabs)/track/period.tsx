import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { Button } from '@/components/ui/Button';
import { useAppDialog } from '@/components/ui/AppDialogProvider';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, HeaderIconButton } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { PeriodLogEngagement } from '@/features/tracking/components/PeriodLogEngagement';
import {
  cycleEndDate,
  findOverlappingCycle,
  isDateInExistingCycle,
  overlapMessageForCycle,
  PERIOD_OVERLAP_MESSAGE,
} from '@/features/tracking/cycleOverlap';
import {
  FUTURE_DATE_MESSAGE,
  PAST_PERIOD_NEEDS_END_MESSAGE,
  PERIOD_TOO_LONG_MESSAGE,
  validatePeriodDates,
  wouldPeriodBeTooLong,
} from '@/features/tracking/periodBounds';
import { useDeletePeriod, useLogPeriod, useUpdatePeriod } from '@/features/tracking/mutations';
import { useCycles } from '@/features/tracking/queries';
import { periodSchema } from '@/features/tracking/validation';
import { calendarFontTheme, colors, screenScrollContent, spacing, typography } from '@/theme';
import type { Cycle } from '@/types/database';

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

/** Softer fill for already-logged periods on the picker calendar. */
const LOGGED_PERIOD_COLOR = '#FACDE0';

const periodCalendarTheme = {
  ...calendarFontTheme,
  textDayFontSize: 14,
  textMonthFontSize: 15,
  textDayHeaderFontSize: 11,
} as const;

export default function PeriodScreen() {
  const router = useRouter();
  const { alert } = useAppDialog();
  const params = useLocalSearchParams<{ id?: string }>();
  const c = colors;
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: cycles = [] } = useCycles();
  const editing = params.id ? cycles.find((cycle) => cycle.id === params.id) : undefined;

  const create = useLogPeriod();
  const update = useUpdatePeriod();
  const remove = useDeletePeriod();

  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string>();
  const scrollRef = useRef<ScrollView>(null);
  const actionsSectionY = useRef(0);
  const scrollAfterEndPick = useRef(false);

  const [seededId, setSeededId] = useState<string | null>(null);
  if (params.id && editing && seededId !== params.id) {
    setSeededId(params.id);
    setStart(editing.start_date);
    setEnd(editing.end_date);
    setNotes(editing.notes ?? '');
  }

  function onDayPress(dateString: string) {
    if (dateString > today) {
      setError(FUTURE_DATE_MESSAGE);
      return;
    }

    if (isDateInExistingCycle(cycles, dateString, editing?.id)) {
      setError(PERIOD_OVERLAP_MESSAGE);
      return;
    }

    setError(undefined);

    if (!start || (start && end)) {
      setStart(dateString);
      setEnd(null);
      scrollAfterEndPick.current = false;
    } else if (dateString < start) {
      if (isDateInExistingCycle(cycles, dateString, editing?.id)) {
        setError(PERIOD_OVERLAP_MESSAGE);
        return;
      }
      setStart(dateString);
      setEnd(null);
      scrollAfterEndPick.current = false;
    } else {
      if (wouldPeriodBeTooLong(start, dateString, today)) {
        setError(PERIOD_TOO_LONG_MESSAGE);
        return;
      }
      const overlap = findOverlappingCycle(cycles, start, dateString, editing?.id);
      if (overlap) {
        setError(overlapMessageForCycle(overlap));
        return;
      }
      setEnd(dateString);
      scrollAfterEndPick.current = true;
    }
  }

  function onActionsSectionLayout(event: LayoutChangeEvent) {
    actionsSectionY.current = event.nativeEvent.layout.y;
    if (!scrollAfterEndPick.current) return;

    scrollAfterEndPick.current = false;
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, actionsSectionY.current - spacing.lg),
        animated: true,
      });
    }, 440);
  }

  function onSave() {
    setError(undefined);
    const parsed = periodSchema.safeParse({
      start_date: start,
      end_date: end,
      notes: notes.trim() || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Pick a start date');
      return;
    }

    const overlap = findOverlappingCycle(
      cycles,
      parsed.data.start_date,
      parsed.data.end_date ?? null,
      editing?.id,
    );
    if (overlap) {
      setError(overlapMessageForCycle(overlap));
      return;
    }

    const boundsError = validatePeriodDates(
      parsed.data.start_date,
      parsed.data.end_date ?? null,
      today,
    );
    if (boundsError) {
      setError(boundsError);
      return;
    }

    const opts = {
      onSuccess: () => router.back(),
      onError: () => setError('Could not save. Please try again.'),
    };
    if (editing) update.mutate({ id: editing.id, form: parsed.data }, opts);
    else create.mutate(parsed.data, opts);
  }

  function onDelete() {
    if (!editing) return;
    alert('Delete period', 'Delete this logged period?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          remove.mutate(editing.id, {
            onSuccess: () => router.back(),
            onError: () => setError('Could not delete. Please try again.'),
          }),
      },
    ]);
  }

  const marked = useMemo(() => {
    const logged = buildLoggedPeriodMarks(cycles, editing?.id, LOGGED_PERIOD_COLOR, colors.primary);
    const selection = buildRange(start, end, c.primary, c.primaryText);
    return { ...logged, ...selection };
  }, [cycles, editing?.id, start, end, c.primary, c.primaryText]);
  const saving = create.isPending || update.isPending;

  return (
    <Screen>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <ScreenHeader
          subtitle="Tap start day, then last day — or leave end unset if ongoing. Swipe the calendar back to log earlier periods."
          onBack={() => router.back()}
          right={
            <HeaderIconButton
              icon="settings-outline"
              onPress={() => router.push('/(account)/settings')}
              accessibilityLabel="Open settings"
            />
          }
        />

        <View style={styles.calendarSection}>
          <Calendar
            markingType="period"
            markedDates={marked}
            maxDate={today}
            onDayPress={(day) => onDayPress(day.dateString)}
            enableSwipeMonths
            style={styles.calendar}
            theme={{
              ...periodCalendarTheme,
              calendarBackground: 'transparent',
              backgroundColor: 'transparent',
              dayTextColor: c.text,
              monthTextColor: c.text,
              textDisabledColor: c.textFaint,
              arrowColor: c.primary,
              todayTextColor: c.primary,
              textSectionTitleColor: c.textMuted,
            }}
          />

          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text style={[typography.caption, { color: c.textMuted }]}>
                Start{' '}
                <Text style={[typography.captionMedium, { color: c.text }]}>
                  {start ? format(parseISO(start), 'd MMM yyyy') : '—'}
                </Text>
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[typography.caption, { color: c.textMuted }]}>
                End{' '}
                <Text style={[typography.captionMedium, { color: c.text }]}>
                  {end ? format(parseISO(end), 'd MMM yyyy') : 'ongoing'}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {start ? <PeriodLogEngagement start={start} end={end} /> : null}

        <TextField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional"
          multiline
          numberOfLines={2}
        />

        <View onLayout={onActionsSectionLayout} style={styles.actionsSection}>
          {error ? <Text style={[typography.caption, { color: c.danger }]}>{error}</Text> : null}

          <View style={styles.actionsRow}>
            <Button
              label="Cancel"
              variant="secondary"
              onPress={() => router.back()}
              style={styles.actionButton}
            />
            <Button
              label={editing ? 'Save changes' : 'Save period'}
              onPress={onSave}
              loading={saving}
              disabled={!start}
              style={styles.actionButton}
            />
          </View>
          {editing ? (
            <Button
              label="Delete period"
              variant="danger"
              onPress={onDelete}
              loading={remove.isPending}
            />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

type PeriodMark = {
  startingDay?: boolean;
  endingDay?: boolean;
  color?: string;
  textColor?: string;
  disableTouchEvent?: boolean;
};

function buildLoggedPeriodMarks(
  cycles: Cycle[],
  excludeCycleId: string | undefined,
  color: string,
  textColor: string,
): Record<string, PeriodMark> {
  const marks: Record<string, PeriodMark> = {};

  for (const cycle of cycles) {
    if (excludeCycleId && cycle.id === excludeCycleId) continue;

    const end = cycleEndDate(cycle);
    const days = eachDayOfInterval({
      start: parseISO(cycle.start_date),
      end: parseISO(end),
    }).map(iso);

    days.forEach((day, index) => {
      marks[day] = {
        startingDay: index === 0,
        endingDay: index === days.length - 1,
        color,
        textColor,
        disableTouchEvent: true,
      };
    });
  }

  return marks;
}

function buildRange(
  start: string | null,
  end: string | null,
  color: string,
  textColor: string,
): Record<string, PeriodMark> {
  if (!start) return {};
  if (!end) {
    return { [start]: { startingDay: true, endingDay: true, color, textColor } };
  }
  const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) }).map(iso);
  const marks: Record<string, PeriodMark> = {};
  days.forEach((day, index) => {
    marks[day] = {
      startingDay: index === 0,
      endingDay: index === days.length - 1,
      color,
      textColor,
    };
  });
  return marks;
}

const styles = StyleSheet.create({
  scroll: screenScrollContent,
  calendarSection: {
    gap: spacing.sm,
    marginHorizontal: -spacing.xs,
  },
  calendar: {
    marginHorizontal: -spacing.sm,
  },
  summary: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  summaryItem: {
    flex: 1,
  },
  actionsSection: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
