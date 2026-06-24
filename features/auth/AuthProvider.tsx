import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { analytics } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  /** The current session, or null when signed out. */
  session: Session | null;
  /** True while the persisted session is being restored on launch. */
  isLoading: boolean;
  /** True when the signed-in user is an anonymous guest (can be upgraded to a real account). */
  isGuest: boolean;
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

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // Log the transition for debugging. Only the event name + whether the account is
      // anonymous — NEVER tokens, email, or any personal data (see CLAUDE.md).
      console.log(`[auth] ${event} (guest=${nextSession?.user.is_anonymous ?? false})`);
      setSession(nextSession);

      // Analytics: associate events with the user id (UUID only); no PII/health data.
      if (nextSession?.user) {
        analytics.identify(nextSession.user.id);
        if (event === 'SIGNED_IN') analytics.track('signed_in');
      } else if (event === 'SIGNED_OUT') {
        analytics.reset();
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Auto-refresh tokens only while the app is in the foreground.
  useEffect(() => {
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
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, isLoading, isGuest: session?.user.is_anonymous ?? false }),
    [session, isLoading],
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
