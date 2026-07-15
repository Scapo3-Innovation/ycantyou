import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { PremiumListItem } from '@/components/ui/PremiumListItem';
import { PremiumSection } from '@/components/ui/PremiumSection';
import { Screen } from '@/components/ui/Screen';
import { signOut } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';
import { ProfileForm } from '@/features/profile/ProfileForm';
import { ProfileGuestBanner } from '@/features/profile/components/ProfileGuestBanner';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileInsightsSection } from '@/features/profile/components/ProfileInsightsSection';
import { useProfile } from '@/features/profile/useProfile';
import { fullScreenScrollContent, spacing } from '@/theme';

export default function ProfileScreen() {
  const { session, isGuest } = useAuth();
  const router = useRouter();
  const userId = session?.user.id;

  const { data: profile, isLoading } = useProfile(userId);

  function onLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  if (isLoading || !profile || !userId) return <LoadingScreen />;

  function onBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          fullName={profile.full_name}
          onSettings={() => router.push('/(account)/settings')}
          onBack={onBack}
        />

        {isGuest ? (
          <ProfileGuestBanner onUpgrade={() => router.push('/(account)/upgrade')} />
        ) : null}

        <ProfileForm key={userId} userId={userId} profile={profile} />

        <ProfileInsightsSection onOpenAnalytics={() => router.push('/(tabs)/analytics')} />

        <PremiumSection label="Account">
          <PremiumListItem
            title="Settings & privacy"
            subtitle="Notifications, export, legal, and feedback"
            leftIcon="shield-checkmark-outline"
            onPress={() => router.push('/(account)/settings')}
          />
          <Button label="Log out" variant="secondary" onPress={onLogout} />
        </PremiumSection>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    ...fullScreenScrollContent,
    gap: spacing.xl,
  },
});
