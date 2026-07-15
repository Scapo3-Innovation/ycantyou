import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useAppDialog } from '@/components/ui/AppDialogProvider';
import { Card } from '@/components/ui/Card';
import { PremiumListItem } from '@/components/ui/PremiumListItem';
import { PremiumSectionLabel } from '@/components/ui/PremiumSection';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { signOut } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';
import { DATA_PROMISE } from '@/features/privacy/constants';
import { exportAsJson, exportAsPdf, gatherUserData } from '@/features/privacy/export';
import { requestAccountDeletion } from '@/features/profile/api';
import {
  SettingsPrivacyHero,
  SettingsSection,
} from '@/features/settings/components/SettingsSection';
import { SettingsToggleRow } from '@/features/settings/components/SettingsToggleRow';
import { clearTourCompleted } from '@/features/tour/storage';
import { useTour } from '@/features/tour/TourContext';
import { notificationsSupported } from '@/features/tracking/notifications';
import { useReminders } from '@/features/tracking/useReminders';
import { analytics } from '@/lib/analytics';
import { colors, fullScreenScrollContent, radius, spacing, typography } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { alert } = useAppDialog();
  const userId = session?.user.id;
  const reminders = useReminders();
  const { startTour } = useTour();
  const [exporting, setExporting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: requestAccountDeletion,
    onSuccess: () => {
      analytics.reset();
      void signOut();
    },
    onError: () =>
      alert('Could not delete account', 'Something went wrong. Please try again later.'),
  });

  async function runExport(kind: 'json' | 'pdf') {
    if (!userId) return;
    setExporting(true);
    try {
      const bundle = await gatherUserData(userId, new Date().toISOString());
      const ok = kind === 'json' ? await exportAsJson(bundle) : await exportAsPdf(bundle);
      if (!ok) alert('Sharing unavailable', 'Sharing is not available on this device.');
    } catch {
      alert('Export failed', 'Could not gather your data. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  function onExport() {
    alert(
      'Export your data',
      'Choose a format. Your data never leaves your device until you share it.',
      [
        { text: 'JSON (complete)', onPress: () => void runExport('json') },
        { text: 'PDF (summary)', onPress: () => void runExport('pdf') },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }

  function onDelete() {
    alert('Delete account', 'This permanently deletes your account and all your data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', style: 'destructive', onPress: confirmDelete },
    ]);
  }

  function confirmDelete() {
    alert('Are you absolutely sure?', 'This cannot be undone. Everything will be erased.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete forever', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  }

  async function onToggleReminders() {
    const ok = await reminders.setEnabled(!reminders.enabled);
    if (!ok && !reminders.enabled) {
      alert(
        'Notifications off',
        'Enable notifications in your device settings to get reminders.',
      );
    }
  }

  async function onReplayTour() {
    if (userId) await clearTourCompleted(userId);
    router.replace('/(tabs)');
    startTour();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Settings" subtitle="Privacy & preferences" onBack={() => router.back()} />

        <SettingsPrivacyHero title="We never sell your data" body={DATA_PROMISE} />

        <SettingsSection label="Preferences">
          {notificationsSupported ? (
            <SettingsToggleRow
              icon="notifications-outline"
              title="Daily log reminder"
              subtitle={reminders.enabled ? 'On — gentle nudge each evening' : 'Off'}
              value={reminders.enabled}
              onValueChange={() => void onToggleReminders()}
              loading={reminders.busy || reminders.loading}
            />
          ) : (
            <Card style={styles.noteCard}>
              <Text style={[typography.caption, { color: colors.textMuted, lineHeight: 18 }]}>
                Reminders need a development build on Android — not available in Expo Go.
              </Text>
            </Card>
          )}
          <PremiumListItem
            title="Replay app tour"
            subtitle="Walk through tabs and key features"
            leftIcon="compass-outline"
            onPress={() => void onReplayTour()}
          />
        </SettingsSection>

        <SettingsSection label="Privacy & data">
          <PremiumListItem
            title="Export my data"
            subtitle={exporting ? 'Preparing export…' : 'JSON or PDF — yours to keep'}
            leftIcon="download-outline"
            onPress={exporting ? undefined : onExport}
            right={
              exporting ? (
                <Text style={[typography.caption, { color: colors.textMuted }]}>…</Text>
              ) : undefined
            }
          />
          <PremiumListItem
            title="Privacy policy"
            subtitle="How we collect and protect your data"
            leftIcon="document-text-outline"
            onPress={() => router.push('/(account)/privacy-policy')}
          />
          <PremiumListItem
            title="Terms of use"
            subtitle="Rules for using ycantyou"
            leftIcon="reader-outline"
            onPress={() => router.push('/(account)/terms')}
          />
        </SettingsSection>

        <View style={styles.dangerZone}>
          <PremiumSectionLabel>Account</PremiumSectionLabel>
          <Card style={styles.dangerCard}>
            <Text style={[typography.caption, styles.dangerCopy, { color: colors.textMuted }]}>
              Deleting your account permanently removes your profile, logs, screener history, and
              community activity.
            </Text>
            <Button
              label="Delete account"
              variant="danger"
              onPress={onDelete}
              loading={deleteMutation.isPending}
            />
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    ...fullScreenScrollContent,
    gap: spacing.xl,
  },
  noteCard: {
    backgroundColor: colors.surfaceAlt,
  },
  dangerZone: {
    gap: spacing.sm,
  },
  dangerCard: {
    gap: spacing.md,
    borderColor: 'rgba(229, 72, 77, 0.22)',
    borderRadius: radius.lg,
  },
  dangerCopy: {
    lineHeight: 18,
  },
});
