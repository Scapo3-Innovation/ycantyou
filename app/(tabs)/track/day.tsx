import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { FlowLevelPicker } from '@/features/tracking/components/FlowLevelPicker';
import { Scale } from '@/features/tracking/components/Scale';
import { SymptomMultiSelect } from '@/features/tracking/components/SymptomMultiSelect';
import { useDeleteDailyLog, useUpsertDailyLog } from '@/features/tracking/mutations';
import { useDailyLog, useSymptoms } from '@/features/tracking/queries';
import { dailyLogSchema } from '@/features/tracking/validation';
import { colors, spacing, typography } from '@/theme';
import type { FlowLevel } from '@/types/database';

export default function DayLogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date ?? format(new Date(), 'yyyy-MM-dd');
  const c = colors;

  const { data: existing, isLoading } = useDailyLog(date);
  const { data: symptoms = [] } = useSymptoms();
  const upsert = useUpsertDailyLog(date);
  const remove = useDeleteDailyLog(date);

  const [flow, setFlow] = useState<FlowLevel | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [symptomCodes, setSymptomCodes] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  // Seed the form once the existing log (if any) has loaded. Adjusting state during
  // render (guarded by a key) is React's recommended alternative to a seeding effect.
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (!isLoading && seededFor !== date) {
    setSeededFor(date);
    if (existing) {
      setFlow(existing.flow_level);
      setMood(existing.mood);
      setEnergy(existing.energy);
      setNotes(existing.notes ?? '');
      setSymptomCodes(existing.symptom_codes);
    }
  }

  if (isLoading) return <LoadingScreen />;

  function onSave() {
    setError(undefined);
    const parsed = dailyLogSchema.safeParse({
      flow_level: flow,
      mood,
      energy,
      notes: notes.trim() || undefined,
      symptom_codes: symptomCodes,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    upsert.mutate(parsed.data, {
      onSuccess: () => router.back(),
      onError: () => setError('Could not save your log. Please try again.'),
    });
  }

  function onDelete() {
    if (!existing) return;
    Alert.alert('Delete log', `Delete your log for ${date}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          remove.mutate(existing.id, {
            onSuccess: () => router.back(),
            onError: () => setError('Could not delete the log. Please try again.'),
          }),
      },
    ]);
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[typography.bodyMedium, { color: c.text }]}>
              {format(new Date(`${date}T00:00:00`), 'EEEE, d MMMM yyyy')}
            </Text>
          </View>

          <FlowLevelPicker value={flow} onChange={setFlow} />
          <Scale label="Mood" value={mood} onChange={setMood} />
          <Scale label="Energy" value={energy} onChange={setEnergy} />
          <SymptomMultiSelect
            symptoms={symptoms}
            selected={symptomCodes}
            onChange={setSymptomCodes}
          />
          <TextField
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything else worth remembering?"
            multiline
            numberOfLines={3}
          />

          {error ? <Text style={[typography.caption, { color: c.danger }]}>{error}</Text> : null}

          <Button label="Save" onPress={onSave} loading={upsert.isPending} />
          {existing ? (
            <Button
              label="Delete log"
              variant="danger"
              onPress={onDelete}
              loading={remove.isPending}
            />
          ) : null}
          <Button label="Cancel" variant="secondary" onPress={() => router.back()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
});
