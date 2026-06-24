import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';

import { fetchActiveQuestions, fetchHistory, fetchResult } from './api';

/** Query keys for the screener feature. */
export const screenerKeys = {
  questions: () => ['screener', 'questions'] as const,
  result: (sessionId: string) => ['screener', 'result', sessionId] as const,
  history: (userId: string | undefined) => ['screener', 'history', userId] as const,
};

/** Active screener questions (rarely change — cached aggressively). */
export function useActiveQuestions() {
  return useQuery({
    queryKey: screenerKeys.questions(),
    queryFn: fetchActiveQuestions,
    staleTime: Infinity,
  });
}

/** The result for a session. */
export function useScreenerResult(sessionId: string) {
  return useQuery({
    queryKey: screenerKeys.result(sessionId),
    queryFn: () => fetchResult(sessionId),
    enabled: Boolean(sessionId),
  });
}

/** Past screener results. */
export function useScreenerHistory() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: screenerKeys.history(userId),
    queryFn: () => fetchHistory(userId as string),
    enabled: Boolean(userId),
  });
}
