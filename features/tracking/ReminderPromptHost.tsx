import { useEffect, useRef, useState } from 'react';

import { useAppDialog } from '@/components/ui/AppDialogProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { shouldAutoStartTour, useTourOptional } from '@/features/tour/TourContext';
import { ReminderPromptModal } from '@/features/tracking/components/ReminderPromptModal';
import { notificationsSupported } from '@/features/tracking/notifications';
import { REMINDER_PROMPT_COPY } from '@/features/tracking/reminderPromptCopy';
import {
  getReminderPromptStatus,
  setReminderPromptStatus,
} from '@/features/tracking/reminderPromptStorage';
import { useReminders } from '@/features/tracking/useReminders';
import { supabase } from '@/lib/supabase';

const POST_TOUR_DELAY_MS = 1200;

/** Shows a one-time reminder explainer after login (post-tour) — not in Settings. */
export function ReminderPromptHost() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { alert } = useAppDialog();
  const reminders = useReminders();
  const tour = useTourOptional();
  const isTourActive = tour?.isActive ?? false;

  const [visible, setVisible] = useState(false);
  const [promptStatus, setPromptStatus] = useState<'loading' | 'pending' | 'dismissed' | 'enabled'>(
    'loading',
  );
  const [tourGateOpen, setTourGateOpen] = useState(false);
  const tourWasActiveRef = useRef(false);

  useEffect(() => {
    if (!userId) {
      setPromptStatus('loading');
      setVisible(false);
      return;
    }

    let cancelled = false;
    void getReminderPromptStatus(userId).then((status) => {
      if (!cancelled) setPromptStatus(status);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (reminders.enabled && userId) {
      void setReminderPromptStatus(userId, 'enabled');
      setPromptStatus('enabled');
      setVisible(false);
    }
  }, [reminders.enabled, userId]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
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
      if (!shouldStart) setTourGateOpen(true);
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

  const canShow =
    Boolean(userId) &&
    notificationsSupported &&
    !reminders.loading &&
    !reminders.enabled &&
    promptStatus === 'pending' &&
    tourGateOpen &&
    !isTourActive;

  useEffect(() => {
    if (!canShow) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => setVisible(true), POST_TOUR_DELAY_MS);
    return () => clearTimeout(timer);
  }, [canShow]);

  async function onEnable() {
    if (!userId) return;
    const ok = await reminders.setEnabled(true);
    if (ok) {
      await setReminderPromptStatus(userId, 'enabled');
      setPromptStatus('enabled');
      setVisible(false);
      return;
    }

    alert(
      REMINDER_PROMPT_COPY.permissionDeniedTitle,
      REMINDER_PROMPT_COPY.permissionDeniedBody,
    );
  }

  async function onLater() {
    if (!userId) return;
    await setReminderPromptStatus(userId, 'dismissed');
    setPromptStatus('dismissed');
    setVisible(false);
  }

  return (
    <ReminderPromptModal
      visible={visible}
      loading={reminders.busy}
      onEnable={() => void onEnable()}
      onLater={() => void onLater()}
    />
  );
}
