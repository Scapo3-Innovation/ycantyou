import 'react-native-url-polyfill/auto';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/useProfile';
import { queryClient } from '@/lib/queryClient';

/**
 * Root layout: installs the URL polyfill (required by supabase-js on RN),
 * wraps the app in the TanStack Query provider, safe-area context, and the auth
 * provider, then hands off to the guarded navigator.
 */
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

/**
 * Decides which route group is reachable based on auth + onboarding state.
 * Expo Router's <Stack.Protected> redirects automatically when a guard flips,
 * so signing in / completing onboarding / logging out all "just work".
 */
function RootNavigator() {
  const { session, isLoading: authLoading } = useAuth();
  const userId = session?.user.id;
  const { data: profile, isLoading: profileLoading } = useProfile(userId);

  // Wait for the session to restore and (when signed in) the profile to load,
  // so we never flash the wrong group on launch.
  if (authLoading || (session && profileLoading)) {
    return <LoadingScreen />;
  }

  const isSignedIn = Boolean(session);
  const isOnboarded = profile?.onboarding_status === 'completed';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isSignedIn && !isOnboarded}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>

      <Stack.Protected guard={isSignedIn && isOnboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(account)" />
        <Stack.Screen name="(screener)" />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
