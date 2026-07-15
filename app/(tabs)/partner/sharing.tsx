import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  AdvancedSharingAccordion,
  SharingToggleList,
} from '@/features/partner/components/SharingToggleList';
import { PartnerPreviewPanel } from '@/features/partner/components/PartnerPreviewPanel';
import { DEFAULT_PARTNER_SHARING } from '@/features/partner/sharingDefaults';
import { usePartnerHub, usePartnerHubMutations } from '@/features/partner/usePartnerHub';
import { analytics } from '@/lib/analytics';
import { colors, spacing, typography } from '@/theme';
import type { PartnerSharingSettings } from '@/types/database';

export default function PartnerSharingScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data: hub, isLoading } = usePartnerHub();
  const { updateSharing } = usePartnerHubMutations(userId);
  const [localSettings, setLocalSettings] = useState<PartnerSharingSettings | null>(null);
  const settings = localSettings ?? (hub?.linked ? hub.sharing_settings : DEFAULT_PARTNER_SHARING);

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string>();

  const baseline = hub?.linked ? hub.sharing_settings : DEFAULT_PARTNER_SHARING;

  function onToggle(key: keyof PartnerSharingSettings, value: boolean) {
    setLocalSettings((prev) => ({ ...(prev ?? baseline), [key]: value }));
    setDirty(true);
  }

  async function onSave() {
    setError(undefined);
    try {
      await updateSharing.mutateAsync(settings);
      analytics.track('partner_sharing_updated');
      setDirty(false);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save sharing settings.');
    }
  }

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Sharing"
        subtitle="What your partner can see"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, screenBodyPadding]}
        showsVerticalScrollIndicator={false}>
        <SharingToggleList settings={settings} onChange={onToggle} />
        <AdvancedSharingAccordion
          expanded={advancedOpen}
          onToggle={() => setAdvancedOpen((v) => !v)}
          settings={settings}
          onChange={onToggle}
        />
        <PartnerPreviewPanel settings={settings} />
        {error ? (
          <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text>
        ) : null}
        {hub?.linked ? (
          <Button
            label={updateSharing.isPending ? 'Saving…' : 'Save preferences'}
            onPress={() => void onSave()}
            disabled={!dirty || updateSharing.isPending}
          />
        ) : (
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Default sharing applies when your partner joins. You can customize these settings after
            they connect.
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
});
