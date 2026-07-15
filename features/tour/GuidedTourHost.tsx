import { useEffect, useRef } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/useProfile';

import { GuidedTourOverlay } from './GuidedTourOverlay';
import { shouldAutoStartTour, useTour } from './TourContext';

const AUTO_START_DELAY_MS = 1600;

/** Auto-starts the tour once per user; renders the spotlight overlay. */
export function GuidedTourHost() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data: profile } = useProfile(userId);
  const { isActive, startTour } = useTour();
  const startedRef = useRef(false);

  const isOnboarded = profile?.onboarding_status === 'completed';
  const isPartner = profile?.account_mode === 'partner';

  useEffect(() => {
    if (!userId || !isOnboarded || isPartner || isActive || startedRef.current) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      void shouldAutoStartTour(userId).then((shouldStart) => {
        if (cancelled || !shouldStart || startedRef.current) return;
        startedRef.current = true;
        startTour();
      });
    }, AUTO_START_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [userId, isOnboarded, isPartner, isActive, startTour]);

  return <GuidedTourOverlay />;
}
