import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/useProfile';
import { shouldAutoStartTour, useTourOptional } from '@/features/tour/TourContext';
import { PeriodLogPromptModal } from '@/features/tracking/components/PeriodLogPromptModal';
import { useCycles } from '@/features/tracking/queries';
import { supabase } from '@/lib/supabase';

const POST_TOUR_DELAY_MS = 480;

/** Shows a one-time-per-session prompt after login when the user has no period logs yet. */
export function PeriodLogPromptHost() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data: profile } = useProfile(userId);
  const { data: cycles = [], isLoading, isSuccess } = useCycles();
  const tour = useTourOptional();
  const isTourActive = tour?.isActive ?? false;

  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [tourGateOpen, setTourGateOpen] = useState(false);
  const tourWasActiveRef = useRef(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setDismissed(false);
        setTourGateOpen(false);
        tourWasActiveRef.current = false;
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setTourGateOpen(false);
      tourWasActiveRef.current = false;
      return;
    }

    let cancelled = false;
    void shouldAutoStartTour(userId).then((shouldStart) => {
      if (cancelled) return;
      if (!shouldStart) {
        setTourGateOpen(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (isTourActive) {
      tourWasActiveRef.current = true;
      setVisible(false);
    }
  }, [isTourActive]);

  useEffect(() => {
    if (tourWasActiveRef.current && !isTourActive) {
      setTourGateOpen(true);
    }
  }, [isTourActive]);

  const wantsPrompt =
    Boolean(userId) && isSuccess && !isLoading && !dismissed && cycles.length === 0;
  const canShowPrompt = wantsPrompt && tourGateOpen && !isTourActive;

  useEffect(() => {
    if (!canShowPrompt) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => setVisible(true), POST_TOUR_DELAY_MS);
    return () => clearTimeout(timer);
  }, [canShowPrompt]);

  function onLogPeriod() {
    setVisible(false);
    router.push('/(tabs)/track/period');
  }

  function onLater() {
    setDismissed(true);
    setVisible(false);
  }

  return (
    <PeriodLogPromptModal
      visible={visible}
      userName={profile?.full_name}
      onLogPeriod={onLogPeriod}
      onLater={onLater}
    />
  );
}
