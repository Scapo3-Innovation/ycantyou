import 'react-native-url-polyfill/auto';
import 'react-native-reanimated';

import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { useReturnToWelcomeOnSignOut } from '@/features/auth/useReturnToWelcomeOnSignOut';
import { useProfile } from '@/features/profile/useProfile';
import { applyDefaultFont } from '@/lib/applyDefaultFont';
import { persistOptions } from '@/lib/persister';
import { queryClient } from '@/lib/queryClient';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* splash already hidden — dev reload */
});

let defaultFontApplied = false;

/**
 * Root layout: installs the URL polyfill (required by supabase-js on RN), wraps the app in
 * the persisted TanStack Query provider (offline reads for public content only), safe-area
 * context, and the auth provider, then hands off to the guarded navigator.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;
    if (!defaultFontApplied) {
      applyDefaultFont();
      defaultFontApplied = true;
    }
    void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}

/**
 * Decides which route group is reachable based on auth + onboarding state.
 * Expo Router's <Stack.Protected> redirects automatically when a guard flips,
 * so signing in / completing onboarding / logging out all "just work".
 */
function RootNavigator() {
  const { session, isLoading: authLoading } = useAuth();
  useReturnToWelcomeOnSignOut();
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
