import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { profileQueryKey } from '@/features/profile/useProfile';

import { disconnectAsPartner, fetchPartnerCalendarRange, fetchPartnerDashboard } from './api';
import { partnerCalendarQueryKey, partnerDashboardQueryKey } from './usePartnerHub';

export function usePartnerDashboard() {
  return useQuery({
    queryKey: partnerDashboardQueryKey,
    queryFn: fetchPartnerDashboard,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
}

export function usePartnerCalendarRange(start: string, end: string, enabled: boolean) {
  return useQuery({
    queryKey: partnerCalendarQueryKey(start, end),
    queryFn: () => fetchPartnerCalendarRange(start, end),
    enabled,
    staleTime: 60_000,
  });
}

export function useDisconnectAsPartner(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectAsPartner,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: partnerDashboardQueryKey });
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
      }
    },
  });
}
