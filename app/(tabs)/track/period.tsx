import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useDeletePeriod, useLogPeriod, useUpdatePeriod } from '@/features/tracking/mutations';
import { useCycles } from '@/features/tracking/queries';
import { periodSchema } from '@/features/tracking/validation';
import { colors, spacing, typography } from '@/theme';

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

export default function PeriodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  const { data: cycles = [] } = useCycles();
  const editing = params.id ? cycles.find((cycle) => cycle.id === params.id) : undefined;

  const create = useLogPeriod();
  const update = useUpdatePeriod();
  const remove = useDeletePeriod();

  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string>();

  // Seed once from the cycle being edited (render-time state adjustment, guarded by id).
  const [seededId, setSeededId] = useState<string | null>(null);
  if (params.id && editing && seededId !== params.id) {
    setSeededId(params.id);
    setStart(editing.start_date);
    setEnd(editing.end_date);
    setNotes(editing.notes ?? '');
  }

  // Tap to set start, tap again to set the end; a tap before the start resets it.
  function onDayPress(dateString: string) {
    if (!start || (start && end)) {
      setStart(dateString);
      setEnd(null);
    } else if (dateString < start) {
      setStart(dateString);
    } else {
      setEnd(dateString);
    }
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
    const opts = {
      onSuccess: () => router.back(),
      onError: () => setError('Could not save. Please try again.'),
    };
    if (editing) update.mutate({ id: editing.id, form: parsed.data }, opts);
    else create.mutate(parsed.data, opts);
  }

  function onDelete() {
    if (!editing) return;
    Alert.alert('Delete period', 'Delete this logged period?', [
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

  const marked = buildRange(start, end, c.primary, c.primaryText);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[typography.title, { color: c.text }]}>
            {editing ? 'Edit period' : 'Log period'}
          </Text>
          <Text style={[typography.body, { color: c.textMuted }]}>
            Tap your period&apos;s start day, then its last day. Leave the end unset if it&apos;s
            ongoing.
          </Text>
        </View>

        <Calendar
          markingType="period"
          markedDates={marked}
          onDayPress={(day) => onDayPress(day.dateString)}
          enableSwipeMonths
          theme={{
            calendarBackground: c.background,
            dayTextColor: c.text,
            monthTextColor: c.text,
            textDisabledColor: c.textMuted,
            arrowColor: c.primary,
            todayTextColor: c.primary,
            textSectionTitleColor: c.textMuted,
          }}
        />

        <View style={styles.summary}>
          <Text style={[typography.body, { color: c.text }]}>
            Start: {start ? format(parseISO(start), 'd MMM yyyy') : '—'}
          </Text>
          <Text style={[typography.body, { color: c.text }]}>
            End: {end ? format(parseISO(end), 'd MMM yyyy') : 'ongoing'}
          </Text>
        </View>

        <TextField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional"
          multiline
          numberOfLines={2}
        />

        {error ? <Text style={[typography.caption, { color: c.danger }]}>{error}</Text> : null}

        <Button
          label={editing ? 'Save changes' : 'Save period'}
          onPress={onSave}
          loading={create.isPending || update.isPending}
        />
        {editing ? (
          <Button
            label="Delete period"
            variant="danger"
            onPress={onDelete}
            loading={remove.isPending}
          />
        ) : null}
        <Button label="Cancel" variant="secondary" onPress={() => router.back()} />
      </ScrollView>
    </Screen>
  );
}

type PeriodMark = { startingDay?: boolean; endingDay?: boolean; color: string; textColor: string };

/** Build react-native-calendars "period" marking for the selected start→end range. */
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
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  summary: {
    gap: spacing.xs,
  },
});
