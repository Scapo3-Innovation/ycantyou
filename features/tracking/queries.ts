import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';

import { useAuth } from '@/features/auth/AuthProvider';

import { fetchCycles, fetchDailyLog, fetchRecentDailyLogs, fetchSymptoms } from './api';

/** Stable query keys for the tracking feature. */
export const trackingKeys = {
  cycles: (userId: string | undefined) => ['cycles', userId] as const,
  recentLogs: (userId: string | undefined) => ['daily_logs', userId, 'recent'] as const,
  dailyLog: (userId: string | undefined, date: string) => ['daily_log', userId, date] as const,
  symptoms: () => ['symptoms'] as const,
};

/** How far back to load daily logs for calendar marking. */
const RECENT_LOG_DAYS = 180;

/** All of the signed-in user's cycles (most recent first). */
export function useCycles() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: trackingKeys.cycles(userId),
    queryFn: () => fetchCycles(userId as string),
    enabled: Boolean(userId),
  });
}

/** Recent daily logs for marking the calendar. */
export function useRecentDailyLogs() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const since = format(subDays(new Date(), RECENT_LOG_DAYS), 'yyyy-MM-dd');
  return useQuery({
    queryKey: trackingKeys.recentLogs(userId),
    queryFn: () => fetchRecentDailyLogs(userId as string, since),
    enabled: Boolean(userId),
  });
}

/** The daily log (with symptoms) for one date. */
export function useDailyLog(date: string) {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: trackingKeys.dailyLog(userId, date),
    queryFn: () => fetchDailyLog(userId as string, date),
    enabled: Boolean(userId) && Boolean(date),
  });
}

/** The static symptom lookup (rarely changes — cached aggressively). */
export function useSymptoms() {
  return useQuery({
    queryKey: trackingKeys.symptoms(),
    queryFn: fetchSymptoms,
    staleTime: Infinity,
  });
}
