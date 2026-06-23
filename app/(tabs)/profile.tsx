import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { signOut } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';
import { requestAccountDeletion } from '@/features/profile/api';
import { ProfileForm } from '@/features/profile/ProfileForm';
import { useProfile } from '@/features/profile/useProfile';
import { colors, radius, spacing, typography } from '@/theme';

export default function ProfileScreen() {
  const { session, isGuest } = useAuth();
  const router = useRouter();
  const userId = session?.user.id;
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  const { data: profile, isLoading } = useProfile(userId);

  const deleteMutation = useMutation({
    mutationFn: requestAccountDeletion,
    onSuccess: () => {
      void signOut();
    },
    onError: () => {
      Alert.alert(
        'Could not delete account',
        'Something went wrong. Please try again later or contact support.',
      );
    },
  });

  function onLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  function onDelete() {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ],
    );
  }

  if (isLoading || !profile || !userId) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[typography.title, { color: c.text }]}>Profile</Text>

        {isGuest ? (
          <View style={[styles.guestBanner, { backgroundColor: c.surface, borderColor: c.border }]}>
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
          </View>
        ) : null}

        <ProfileForm key={userId} userId={userId} profile={profile} />

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        <Button label="Log out" variant="secondary" onPress={onLogout} />
        <Button
          label="Delete account"
          variant="danger"
          onPress={onDelete}
          loading={deleteMutation.isPending}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  guestBanner: {
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  guestTitle: {
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sm,
  },
});
