import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useAppDialog } from '@/components/ui/AppDialogProvider';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { signOut } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';
import { ProfileForm } from '@/features/profile/ProfileForm';
import { ProfileGuestBanner } from '@/features/profile/components/ProfileGuestBanner';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileHeroCard } from '@/features/profile/components/ProfileHeroCard';
import { ProfileToolsSection } from '@/features/profile/components/ProfileToolsSection';
import { useProfile } from '@/features/profile/useProfile';
import { PremiumSubscriptionSheet } from '@/features/subscription/components/PremiumSubscriptionSheet';
import { ProfileSubscriptionSection } from '@/features/subscription/components/ProfileSubscriptionSection';
import { fullScreenScrollContent, spacing } from '@/theme';

export default function ProfileScreen() {
  const { session, isGuest } = useAuth();
  const router = useRouter();
  const { alert } = useAppDialog();
  const userId = session?.user.id;
  const email = session?.user.email;
  const [premiumOpen, setPremiumOpen] = useState(false);

  const { data: profile, isLoading } = useProfile(userId);

  function onLogout() {
    alert('Log out', 'Are you sure you want to log out?', [
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
        <ProfileHeader onBack={onBack} />

        <ProfileHeroCard
          fullName={profile.full_name}
          email={email}
          isGuest={isGuest}
          avatarUrl={profile.avatar_url}
        />

        {isGuest ? (
          <ProfileGuestBanner onUpgrade={() => router.push('/(account)/upgrade')} />
        ) : null}

        <ProfileToolsSection
          onOpenAnalytics={() => router.push('/(tabs)/analytics')}
          onOpenFeedback={() => router.push('/(account)/feedback')}
          onOpenSettings={() => router.push('/(account)/settings')}
        />

        <ProfileSubscriptionSection onExplorePremium={() => setPremiumOpen(true)} />

        <ProfileForm key={userId} userId={userId} profile={profile} />

        <View style={styles.logout}>
          <Button label="Log out" variant="secondary" onPress={onLogout} />
        </View>
      </ScrollView>

      <PremiumSubscriptionSheet visible={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    ...fullScreenScrollContent,
    gap: spacing.xl,
  },
  logout: {
    paddingTop: spacing.xs,
  },
});
