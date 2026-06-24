import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import { analytics } from '@/lib/analytics';

import { insertResponses, invokeScoring } from './api';
import { screenerKeys } from './queries';
import type { AnswersByCode, ScoringResult } from './types';

/**
 * Submit a completed screener: write all responses, then trigger server-side scoring.
 * Scoring is authoritative (server-side); we just relay the band it returns.
 */
export function useSubmitScreener() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: async ({
      sessionId,
      answers,
    }: {
      sessionId: string;
      answers: AnswersByCode;
    }): Promise<ScoringResult> => {
      await insertResponses(userId as string, sessionId, answers);
      return invokeScoring(sessionId);
    },
    onSuccess: (result) => {
      // The Edge Function wrote the authoritative result row; refetch it + history.
      void qc.invalidateQueries({ queryKey: screenerKeys.result(result.session_id) });
      void qc.invalidateQueries({ queryKey: screenerKeys.history(userId) });
      // No health data in the event — the risk band is deliberately NOT sent.
      analytics.track('screener_completed');
    },
  });
}
