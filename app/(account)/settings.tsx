import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { ListItem } from '@/components/ui/ListItem';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { signOut } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';
import { DATA_PROMISE, PRIVACY_POLICY_URL, TERMS_URL } from '@/features/privacy/constants';
import { exportAsJson, exportAsPdf, gatherUserData } from '@/features/privacy/export';
import { requestAccountDeletion } from '@/features/profile/api';
import { notificationsSupported } from '@/features/tracking/notifications';
import { useReminders } from '@/features/tracking/useReminders';
import { analytics } from '@/lib/analytics';
import { colors, spacing, typography } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const reminders = useReminders();
  const [exporting, setExporting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: requestAccountDeletion,
    onSuccess: () => {
      analytics.reset();
      void signOut();
    },
    onError: () =>
      Alert.alert('Could not delete account', 'Something went wrong. Please try again later.'),
  });

  async function runExport(kind: 'json' | 'pdf') {
    if (!userId) return;
    setExporting(true);
    try {
      const bundle = await gatherUserData(userId, new Date().toISOString());
      const ok = kind === 'json' ? await exportAsJson(bundle) : await exportAsPdf(bundle);
      if (!ok) Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
    } catch {
      Alert.alert('Export failed', 'Could not gather your data. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  function onExport() {
    Alert.alert('Export your data', 'Choose a format. Your data never leaves your device until you share it.', [
      { text: 'JSON (complete)', onPress: () => void runExport('json') },
      { text: 'PDF (summary)', onPress: () => void runExport('pdf') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  // DPDP right to erase — confirmed twice because it is irreversible.
  function onDelete() {
    Alert.alert('Delete account', 'This permanently deletes your account and all your data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', style: 'destructive', onPress: confirmDelete },
    ]);
  }
  function confirmDelete() {
    Alert.alert('Are you absolutely sure?', 'This cannot be undone. Everything will be erased.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete forever', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  }

  async function onToggleReminders() {
    const ok = await reminders.setEnabled(!reminders.enabled);
    if (!ok && !reminders.enabled) {
      Alert.alert('Notifications off', 'Enable notifications in your device settings to get reminders.');
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader onBack={() => router.back()} />

        <Card>
          <View style={styles.promiseHeader}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.secondary} />
            <Text style={[typography.h2, { color: colors.text }]}>We never sell your data</Text>
          </View>
          <Text style={[typography.body, { color: colors.textMuted }]}>{DATA_PROMISE}</Text>
        </Card>

        <SectionHeader title="Legal" />
        <Card>
          <ListItem
            title="Privacy policy"
            leftIcon="document-text-outline"
            onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
          />
          <Divider />
          <ListItem
            title="Terms of use"
            leftIcon="reader-outline"
            onPress={() => void Linking.openURL(TERMS_URL)}
          />
        </Card>

        <SectionHeader title="Your data" />
        <Card>
          <ListItem
            title="Export my data"
            subtitle="Download everything as JSON or PDF"
            leftIcon="download-outline"
            onPress={onExport}
            right={exporting ? <Text style={[typography.caption, { color: colors.textMuted }]}>…</Text> : undefined}
          />
        </Card>
        <Button label="Delete account" variant="danger" onPress={onDelete} loading={deleteMutation.isPending} />

        <SectionHeader title="Notifications" />
        <Card>
          {notificationsSupported ? (
            <ListItem
              title="Daily log reminder"
              subtitle={reminders.enabled ? 'On' : 'Off'}
              leftIcon="notifications-outline"
              right={
                <Button
                  label={reminders.enabled ? 'Turn off' : 'Turn on'}
                  variant="secondary"
                  loading={reminders.busy || reminders.loading}
                  onPress={onToggleReminders}
                />
              }
            />
          ) : (
            <Text style={[typography.body, { color: colors.textMuted }]}>
              Reminders aren’t available in Expo Go on Android — they’ll work in a development build.
            </Text>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  promiseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
