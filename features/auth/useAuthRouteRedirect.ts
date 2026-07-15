import { useRootNavigationState, useRouter, useSegments, type Href } from 'expo-router';
import { useEffect } from 'react';

/**
 * Keeps the visible route in sync with auth + onboarding guards.
 * Stack.Protected usually redirects on its own; this covers cases where the user
 * stays on (auth) after sign-in (e.g. guest) or lands on a stale group.
 */
export function useAuthRouteRedirect(
  authLoading: boolean,
  isSignedIn: boolean,
  isOnboarded: boolean,
  isPartner: boolean,
): void {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (authLoading || !navigationState?.key) return;

    const group = segments[0];
    const inAuth = group === '(auth)';
    const inOnboarding = group === '(onboarding)';

    if (isSignedIn && !isOnboarded && (inAuth || group === 'auth')) {
      router.replace('/(onboarding)');
      return;
    }

    if (isSignedIn && isOnboarded && (inAuth || inOnboarding || group === 'auth')) {
      router.replace((isPartner ? '/(partner-tabs)' : '/(tabs)') as Href);
      return;
    }

    if (isSignedIn && isOnboarded && isPartner && group === '(tabs)') {
      router.replace('/(partner-tabs)' as Href);
      return;
    }

    if (isSignedIn && isOnboarded && !isPartner && group === '(partner-tabs)') {
      router.replace('/(tabs)' as Href);
    }
  }, [
    authLoading,
    isOnboarded,
    isPartner,
    isSignedIn,
    navigationState?.key,
    router,
    segments,
  ]);
}
