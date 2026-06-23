import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import {
  cancelDailyNudge,
  cancelEstimatedPeriodReminder,
  ensureNotificationPermission,
  scheduleDailyNudge,
} from './notifications';

const STORAGE_KEY = 'tracking.reminders_enabled';

/**
 * Reminder preference for the daily-log nudge, persisted in AsyncStorage.
 *
 * Enabling requests notification permission and schedules the (local) daily nudge;
 * disabling cancels all tracking reminders. The estimated-period reminder is scheduled
 * separately by the Track screen once a prediction is available and reminders are on.
 */
export function useReminders() {
  const [enabled, setEnabledState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (mounted) setEnabledState(value === 'true');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setEnabled = useCallback(async (next: boolean) => {
    setBusy(true);
    try {
      if (next) {
        const granted = await ensureNotificationPermission();
        if (!granted) return false;
        await scheduleDailyNudge();
      } else {
        await cancelDailyNudge();
        await cancelEstimatedPeriodReminder();
      }
      await AsyncStorage.setItem(STORAGE_KEY, String(next));
      setEnabledState(next);
      return true;
    } finally {
      setBusy(false);
    }
  }, []);

  return { enabled, loading, busy, setEnabled };
}
