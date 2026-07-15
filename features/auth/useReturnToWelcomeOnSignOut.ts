import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { isGoogleOAuthInProgress } from '@/features/auth/googleOAuth';

/**
 * After sign-out, land on the welcome intro instead of staying on sign-in.
 * Mounted from the root navigator so it runs even when leaving tabs/settings.
 */
export function useReturnToWelcomeOnSignOut() {
  const { session, isLoading } = useAuth();
  const prevSession = useRef<typeof session | undefined>(undefined);

  useEffect(() => {
    if (isLoading) return;

    const hadSession = prevSession.current != null;
    prevSession.current = session;

    if (hadSession && !session && !isGoogleOAuthInProgress()) {
      router.replace('/(auth)/welcome?replay=1');
    }
  }, [session, isLoading]);
}
