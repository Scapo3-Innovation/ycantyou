import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { ListItem } from '@/components/ui/ListItem';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { signOut } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';
import { ProfileForm } from '@/features/profile/ProfileForm';
import { useProfile } from '@/features/profile/useProfile';
import { colors, spacing, typography } from '@/theme';

export default function ProfileScreen() {
  const { session, isGuest } = useAuth();
  const router = useRouter();
  const userId = session?.user.id;
  const c = colors;

  const { data: profile, isLoading } = useProfile(userId);

  function onLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  if (isLoading || !profile || !userId) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[typography.title, { color: c.text }]}>Profile</Text>

        {isGuest ? (
          <Card>
            <Text style={[typography.body, styles.guestTitle, { color: c.text }]}>
              Guest account
            </Text>
            <Text style={[typography.caption, { color: c.textMuted }]}>
              You&apos;re signed in as a guest. Link an email to keep your data safe and sign back
              in later.
            </Text>
            <Button
              label="Upgrade — link an email"
              onPress={() => router.push('/(account)/upgrade')}
            />
          </Card>
        ) : null}

        <ProfileForm key={userId} userId={userId} profile={profile} />

        <Card>
          <ListItem
            title="Settings & privacy"
            subtitle="Export or delete your data, notifications"
            leftIcon="shield-checkmark-outline"
            onPress={() => router.push('/(account)/settings')}
          />
        </Card>

        <Divider style={styles.divider} />

        <Button label="Log out" variant="secondary" onPress={onLogout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  guestTitle: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: spacing.sm,
  },
});
