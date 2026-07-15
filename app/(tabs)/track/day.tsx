import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
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
import { HeaderIconButton, ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { FlowLevelPicker } from '@/features/tracking/components/FlowLevelPicker';
import { SymptomMultiSelect } from '@/features/tracking/components/SymptomMultiSelect';
import { WellnessEmojiPicker } from '@/features/tracking/components/WellnessEmojiPicker';
import { ENERGY_OPTIONS, MOOD_OPTIONS } from '@/features/tracking/constants';
import { useDeleteDailyLog, useUpsertDailyLog } from '@/features/tracking/mutations';
import { useDailyLog, useSymptoms } from '@/features/tracking/queries';
import { dailyLogSchema } from '@/features/tracking/validation';
import { colors, radius, screenScrollContent, spacing, typography } from '@/theme';
import type { FlowLevel } from '@/types/database';

function LogSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[typography.captionMedium, styles.sectionTitle, { color: colors.textMuted }]}>
          {title}
        </Text>
        {hint ? (
          <Text style={[typography.caption, { color: colors.textFaint }]}>{hint}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export default function DayLogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string; mood?: string }>();
  const date = params.date ?? format(new Date(), 'yyyy-MM-dd');
  const prefilledMood = parseMoodParam(params.mood);
  const c = colors;
  const dateLabel = format(new Date(`${date}T00:00:00`), 'EEEE, d MMMM');

  const { data: existing, isLoading } = useDailyLog(date);
  const { data: symptoms = [] } = useSymptoms();
  const upsert = useUpsertDailyLog(date);
  const remove = useDeleteDailyLog(date);
  const isEditing = Boolean(existing);

  const [flow, setFlow] = useState<FlowLevel | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [symptomCodes, setSymptomCodes] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (!isLoading && seededFor !== date) {
    setSeededFor(date);
    if (existing) {
      setFlow(existing.flow_level);
      setMood(existing.mood);
      setEnergy(existing.energy);
      setNotes(existing.notes ?? '');
      setSymptomCodes(existing.symptom_codes);
    } else {
      setFlow(null);
      setMood(prefilledMood);
      setEnergy(null);
      setNotes('');
      setSymptomCodes([]);
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

  const saving = upsert.isPending;

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ScreenHeader
            subtitle={dateLabel}
            onBack={() => router.back()}
            right={
              <HeaderIconButton
                icon="settings-outline"
                onPress={() => router.push('/(account)/settings')}
                accessibilityLabel="Open settings"
              />
            }
          />

          {isEditing ? (
            <View style={styles.editBanner}>
              <Text style={[typography.captionMedium, { color: colors.primary }]}>
                Already logged for this day
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Update your entry below — one log per day.
              </Text>
            </View>
          ) : null}

          <LogSection title="Flow">
            <FlowLevelPicker value={flow} onChange={setFlow} hideLabel />
          </LogSection>

          <LogSection title="How you felt">
            <View style={styles.wellnessBlock}>
              <WellnessEmojiPicker
                label="Mood"
                options={MOOD_OPTIONS}
                value={mood}
                onChange={setMood}
              />
              <WellnessEmojiPicker
                label="Energy"
                options={ENERGY_OPTIONS}
                value={energy}
                onChange={setEnergy}
              />
            </View>
          </LogSection>

          <LogSection title="Symptoms" hint="Tap all that apply today">
            <View style={styles.symptomsBlock}>
              <SymptomMultiSelect
                symptoms={symptoms}
                selected={symptomCodes}
                onChange={setSymptomCodes}
                hideLabel
              />
            </View>
          </LogSection>

          <TextField
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything else worth remembering?"
            multiline
            numberOfLines={3}
          />

          {error ? <Text style={[typography.caption, { color: c.danger }]}>{error}</Text> : null}

          <View style={styles.actionsRow}>
            <Button
              label="Cancel"
              variant="secondary"
              onPress={() => router.back()}
              style={styles.actionButton}
            />
            <Button
              label={isEditing ? 'Update log' : 'Save log'}
              onPress={onSave}
              loading={saving}
              style={styles.actionButton}
            />
          </View>

          {isEditing ? (
            <Button
              label="Delete log"
              variant="danger"
              onPress={onDelete}
              loading={remove.isPending}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function parseMoodParam(value: string | undefined): number | null {
  if (!value) return null;
  const mood = Number(value);
  if (!Number.isInteger(mood)) return null;
  return MOOD_OPTIONS.some((option) => option.value === mood) ? mood : null;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    ...screenScrollContent,
    gap: spacing.lg,
  },
  editBanner: {
    backgroundColor: colors.roseTint,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(231, 106, 138, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  wellnessBlock: {
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  symptomsBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
