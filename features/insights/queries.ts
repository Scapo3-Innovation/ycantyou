import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';

import { fetchCycleLengthStats, fetchSymptomPhasePatterns } from './api';

/** Query keys for the insights feature. */
export const insightsKeys = {
  cycleStats: (userId: string | undefined) => ['insights', 'cycle-stats', userId] as const,
  symptomPatterns: (userId: string | undefined) =>
    ['insights', 'symptom-patterns', userId] as const,
};

/** Server-aggregated cycle-length stats for the dashboard. */
export function useCycleLengthStats() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: insightsKeys.cycleStats(userId),
    queryFn: fetchCycleLengthStats,
    enabled: Boolean(userId),
  });
}

/** Server-aggregated symptom-by-phase counts for the dashboard. */
export function useSymptomPhasePatterns() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: insightsKeys.symptomPatterns(userId),
    queryFn: fetchSymptomPhasePatterns,
    enabled: Boolean(userId),
  });
}
