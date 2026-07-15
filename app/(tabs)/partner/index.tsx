import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { useAppDialog } from '@/components/ui/AppDialogProvider';
import { Card } from '@/components/ui/Card';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  hasPartnerSharingConsent,
  isPartnerSchemaReady,
  recordPartnerSharingConsent,
} from '@/features/partner/api';
import { PartnerLinkedView } from '@/features/partner/components/PartnerLinkedView';
import { PartnerPairingCodeView } from '@/features/partner/components/PartnerPairingCodeView';
import { PartnerPairingIntroView } from '@/features/partner/components/PartnerPairingIntroView';
import { usePartnerHub, usePartnerHubMutations } from '@/features/partner/usePartnerHub';
import { analytics } from '@/lib/analytics';
import { isSchemaNotReadyError, schemaNotReadyMessage } from '@/lib/supabaseErrors';
import { colors, floatingTabBarScrollInset, spacing, typography } from '@/theme';

export default function PartnerScreen() {
  const router = useRouter();
  const { alert } = useAppDialog();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data: hub, isLoading, error, refetch } = usePartnerHub();
  const { createInvite, pause, resume, revoke, cancelInvite } = usePartnerHubMutations(userId);
  const [consentChecked, setConsentChecked] = useState(false);
  const [actionError, setActionError] = useState<string>();
  const [schemaReady, setSchemaReady] = useState(true);

  useEffect(() => {
    void isPartnerSchemaReady().then(setSchemaReady);
  }, []);

  async function onGenerateCode() {
    if (!userId) return;
    setActionError(undefined);
    try {
      const hasConsent = await hasPartnerSharingConsent(userId);
      if (!hasConsent) {
        if (!consentChecked) {
          setActionError('Please confirm you understand what sharing means.');
          return;
        }
        await recordPartnerSharingConsent(userId);
      }
      await createInvite.mutateAsync();
      analytics.track('partner_invite_created');
    } catch (e) {
      if (e instanceof Error && isSchemaNotReadyError(e)) {
        setActionError(schemaNotReadyMessage('Partner linking'));
      } else {
        setActionError(e instanceof Error ? e.message : 'Could not create invite.');
      }
    }
  }

  async function onShareCode(code: string) {
    const message = `Join me on ycantyou with this partner code: ${code}\n\nDownload the app and enter the code when signing up. You'll only see what I choose to share. Code expires in 7 days.`;
    try {
      await Share.share({ message });
      analytics.track('partner_invite_shared');
    } catch {
      /* user dismissed */
    }
  }

  function onRevoke() {
    alert(
      'Revoke partner access?',
      'They will immediately lose access to shared cycle insights.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => void revoke.mutateAsync().catch(() => undefined),
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (error && !hub) {
    return (
      <Screen style={styles.centered}>
        <Text style={[typography.body, { color: colors.danger }]}>
          Could not load partner settings. Check your connection and try again.
        </Text>
        <Button label="Retry" onPress={() => void refetch()} />
      </Screen>
    );
  }

  if (!hub) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (hub.linked) {
    return (
      <Screen>
        <ScrollView
          contentContainerStyle={[styles.scroll, screenBodyPadding]}
          showsVerticalScrollIndicator={false}>
          <PartnerLinkedView
            partnerName={hub.partner_name}
            status={hub.status === 'paused' ? 'paused' : 'active'}
            connectedAt={hub.connected_at}
            onManageSharing={() => router.push('/(tabs)/partner/sharing')}
            onPause={() => void pause.mutateAsync()}
            onResume={() => void resume.mutateAsync()}
            onRevoke={onRevoke}
          />
        </ScrollView>
      </Screen>
    );
  }

  if (hub.pending_invite) {
    return (
      <Screen edgeToEdge style={styles.pairingScreen}>
        <PartnerPairingCodeView
          code={hub.pending_invite.code}
          expiresAt={hub.pending_invite.expires_at}
          onSendCode={() => void onShareCode(hub.pending_invite!.code)}
          onCancelInvite={() => void cancelInvite.mutateAsync()}
          cancelPending={cancelInvite.isPending}
        />
      </Screen>
    );
  }

  return (
    <Screen edgeToEdge style={styles.pairingScreen}>
      <View style={styles.pairingRoot}>
        {!schemaReady ? (
          <View style={styles.setupWrap}>
            <Card style={styles.setupCard}>
              <Text style={[typography.bodyMedium, { color: colors.warning }]}>
                Partner linking needs a database update
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Run migration 0009 in the Supabase SQL Editor to enable pairing codes.
              </Text>
            </Card>
          </View>
        ) : null}
        <PartnerPairingIntroView
        consentChecked={consentChecked}
        onToggleConsent={() => setConsentChecked((v) => !v)}
        onGetCode={() => void onGenerateCode()}
        onOpenSharing={() => router.push('/(tabs)/partner/sharing')}
        loading={createInvite.isPending}
        disabled={!schemaReady}
        error={actionError}
      />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  pairingScreen: {
    backgroundColor: colors.background,
  },
  pairingRoot: {
    flex: 1,
  },
  scroll: {
    paddingBottom: floatingTabBarScrollInset,
    gap: spacing.lg,
  },
  setupWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  setupCard: {
    gap: spacing.xs,
  },
});
