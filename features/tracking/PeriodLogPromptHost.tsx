import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/useProfile';
import { PeriodLogPromptModal } from '@/features/tracking/components/PeriodLogPromptModal';
import { useCycles } from '@/features/tracking/queries';
import { supabase } from '@/lib/supabase';

/** Shows a one-time-per-session prompt after login when the user has no period logs yet. */
export function PeriodLogPromptHost() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data: profile } = useProfile(userId);
  const { data: cycles = [], isLoading, isSuccess } = useCycles();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setDismissed(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSuccess || isLoading || dismissed) return;
    setVisible(cycles.length === 0);
  }, [cycles.length, dismissed, isLoading, isSuccess]);

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
