import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useAppDialog } from '@/components/ui/AppDialogProvider';
import { Card } from '@/components/ui/Card';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/features/auth/AuthProvider';
import { signOut } from '@/features/auth/api';
import { usePartnerDashboard, useDisconnectAsPartner } from '@/features/partner/usePartnerDashboard';
import { useProfile } from '@/features/profile/useProfile';
import { PRIVACY_POLICY_URL } from '@/features/onboarding/constants';
import { colors, spacing, typography } from '@/theme';
import * as Linking from 'expo-linking';

export default function PartnerProfileScreen() {
  const router = useRouter();
  const { alert } = useAppDialog();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data: profile } = useProfile(userId);
  const { data: dashboard } = usePartnerDashboard();
  const disconnect = useDisconnectAsPartner(userId);

  function onDisconnect() {
    alert(
      'Disconnect?',
      'You will lose access to shared cycle insights. You can join again with a new code.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            void disconnect.mutateAsync().then(() => {
              router.replace('/(onboarding)');
            });
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Profile" />

      <ScrollView contentContainerStyle={[styles.scroll, screenBodyPadding]}>
        <Card>
          <Text style={[typography.captionMedium, { color: colors.textMuted }]}>YOU</Text>
          <Text style={[typography.h2, { color: colors.text }]}>
            {profile?.full_name ?? 'Partner'}
          </Text>
        </Card>

        {dashboard?.status === 'active' ? (
          <Card>
            <Text style={[typography.captionMedium, { color: colors.textMuted }]}>LINKED WITH</Text>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>
              {dashboard.primary_name}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Connected {new Date(dashboard.connected_at).toLocaleDateString()}
            </Text>
          </Card>
        ) : null}

        <View style={styles.actions}>
          <Button
            label="Disconnect"
            variant="danger"
            onPress={onDisconnect}
            loading={disconnect.isPending}
          />
          <Button
            label="Privacy policy"
            variant="secondary"
            onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
          />
          <Button label="Sign out" variant="ghost" onPress={() => void signOut()} />
        </View>

        <Text style={[typography.caption, styles.footer, { color: colors.textFaint }]}>
          Partner view is read-only. She controls what you see and can revoke access anytime.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
  },
  footer: {
    textAlign: 'center',
  },
});
