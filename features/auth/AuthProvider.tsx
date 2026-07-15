import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { buildOAuthCallbackUrl } from '@/features/auth/buildOAuthCallbackUrl';
import { logOAuthStep, logOAuthStepError, sanitizeOAuthUrl } from '@/features/auth/authDebugLog';
import { createSessionFromOAuthUrl } from '@/features/auth/googleOAuth';
import { isOAuthRedirectUrl } from '@/features/auth/oauthRedirect';
import { analytics } from '@/lib/analytics';
import { getSupabaseHost, supabase } from '@/lib/supabase';
import { isUnreachableHostError, unreachableSupabaseMessage } from '@/lib/supabaseErrors';

type AuthContextValue = {
  /** The current session, or null when signed out. */
  session: Session | null;
  /** True while the persisted session is being restored on launch. */
  isLoading: boolean;
  /** True when the signed-in user is an anonymous guest (can be upgraded to a real account). */
  isGuest: boolean;
  /** Set when Supabase URL is wrong or unreachable (bad .env / DNS). */
  connectionError: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Holds auth/session state for the whole app.
 *
 * - Restores any persisted session on launch (getSession).
 * - Stays in sync via onAuthStateChange (sign-in, sign-out, token refresh).
 * - Drives Supabase's token auto-refresh off AppState — supabase-js only refreshes
 *   while the app is foregrounded on React Native, so we start/stop it explicitly.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error && isUnreachableHostError(error)) {
          setConnectionError(unreachableSupabaseMessage(getSupabaseHost()));
          return;
        }
        setSession(data.session);
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        if (isUnreachableHostError(error)) {
          setConnectionError(unreachableSupabaseMessage(getSupabaseHost()));
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // Defer React state updates so signInAnonymously / OTP calls are not blocked
      // by the auth client's internal lock (supabase-js deadlock on RN).
      setTimeout(() => {
        if (!mounted) return;
        setSession(nextSession);

        if (nextSession?.user) {
          analytics.identify(nextSession.user.id);
          if (event === 'SIGNED_IN') analytics.track('signed_in');
        } else if (event === 'SIGNED_OUT') {
          analytics.reset();
        }
      }, 0);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Complete OAuth when the app is opened via the redirect deep link (cold start).
  useEffect(() => {
    async function handleOAuthUrl(url: string, trigger: 'initial' | 'event') {
      logOAuthStep('linking.received', {
        trigger,
        url: sanitizeOAuthUrl(url),
      });

      const callbackUrl = buildOAuthCallbackUrl(url, {});
      const matches = Boolean(callbackUrl && isOAuthRedirectUrl(callbackUrl));

      logOAuthStep('linking.evaluated', {
        trigger,
        callbackUrl: sanitizeOAuthUrl(callbackUrl),
        matches,
      });

      if (!callbackUrl || !matches) return;

      try {
        await createSessionFromOAuthUrl(callbackUrl, 'linking');
        logOAuthStep('linking.sessionCreated');
      } catch (error) {
        logOAuthStepError('linking.sessionCreate', error, { trigger });
      }
    }

    void Linking.getInitialURL().then((url) => {
      if (url) void handleOAuthUrl(url, 'initial');
      else logOAuthStep('linking.initialUrl.empty');
    });

    const sub = Linking.addEventListener('url', ({ url }) => {
      void handleOAuthUrl(url, 'event');
    });
    return () => sub.remove();
  }, []);

  // Auto-refresh tokens only while the app is in the foreground.
  useEffect(() => {
    if (connectionError) return;

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });
    if (AppState.currentState === 'active') {
      supabase.auth.startAutoRefresh();
    }
    return () => appStateSub.remove();
  }, [connectionError]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      isGuest: session?.user.is_anonymous ?? false,
      connectionError,
    }),
    [session, isLoading, connectionError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the current session + loading state. Must be used under <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
