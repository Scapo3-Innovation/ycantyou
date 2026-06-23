import { parseISO, subDays } from 'date-fns';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import {
  DAILY_NUDGE_HOUR,
  DAILY_NUDGE_MINUTE,
  PERIOD_REMINDER_LEAD_DAYS,
} from './constants';

/**
 * LOCAL scheduled notifications only — these work in Expo Go.
 *
 * Remote push is intentionally NOT implemented here (it needs a development build, not
 * Expo Go); see the clearly-marked stub at the bottom.
 *
 * Never put health data in a notification body (lock-screen visible). Keep copy generic.
 */

const DAILY_NUDGE_ID = 'daily-log-nudge';
const PERIOD_REMINDER_ID = 'estimated-period-reminder';
const HOUR_FOR_PERIOD_REMINDER = 9;

// Show notifications while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Ask for notification permission (and set up the Android channel). Returns whether granted. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/** Schedule (or reschedule) the daily log nudge at the default time, repeating daily. */
export async function scheduleDailyNudge(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_NUDGE_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_NUDGE_ID,
    content: {
      title: 'How are you feeling today?',
      body: 'Take a moment to log your day.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: DAILY_NUDGE_HOUR,
      minute: DAILY_NUDGE_MINUTE,
    },
  });
}

/** Cancel the daily log nudge. */
export async function cancelDailyNudge(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_NUDGE_ID).catch(() => {});
}

/**
 * Schedule a one-off reminder a couple of days before the estimated next period.
 * No-op (and clears any prior reminder) if the target time is already in the past.
 */
export async function scheduleEstimatedPeriodReminder(predictedStartIso: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(PERIOD_REMINDER_ID).catch(() => {});

  const when = subDays(parseISO(predictedStartIso), PERIOD_REMINDER_LEAD_DAYS);
  when.setHours(HOUR_FOR_PERIOD_REMINDER, 0, 0, 0);
  if (when.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: PERIOD_REMINDER_ID,
    content: {
      title: 'Heads up',
      body: 'Your next period may be coming soon (this is an estimate).',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
  });
}

/** Cancel the estimated-period reminder. */
export async function cancelEstimatedPeriodReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(PERIOD_REMINDER_ID).catch(() => {});
}

// ---------------------------------------------------------------------------
// STUB — remote push notifications. NOT available in Expo Go; requires a dev build
// (expo-notifications push tokens + a server). Wire this up in a later module.
// ---------------------------------------------------------------------------

/** TODO(remote-push): needs a development build + push server. Not callable in Expo Go. */
export async function registerForRemotePushAsync(): Promise<null> {
  console.warn('[notifications] Remote push is not available in Expo Go (stub). Skipping.');
  return null;
}
