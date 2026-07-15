import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { profileQueryKey } from '@/features/profile/useProfile';

import {
  cancelPartnerInvite,
  createPartnerInvite,
  fetchPrimaryPartnerHub,
  pausePartnerSharing,
  resumePartnerSharing,
  revokePartnerConnection,
  updatePartnerSharing,
} from './api';
import type { PartnerSharingSettings } from '@/types/database';
import { isSchemaNotReadyError } from '@/lib/supabaseErrors';

export const partnerHubQueryKey = ['partner-hub'] as const;
export const partnerDashboardQueryKey = ['partner-dashboard'] as const;
export const partnerCalendarQueryKey = (start: string, end: string) =>
  ['partner-calendar', start, end] as const;

export function usePartnerHub() {
  return useQuery({
    queryKey: partnerHubQueryKey,
    queryFn: fetchPrimaryPartnerHub,
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (isSchemaNotReadyError(error)) return false;
      return failureCount < 2;
    },
  });
}

export function usePartnerHubMutations(userId: string | undefined) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: partnerHubQueryKey });
    await queryClient.invalidateQueries({ queryKey: partnerDashboardQueryKey });
    if (userId) {
      await queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
    }
  };

  const createInvite = useMutation({
    mutationFn: createPartnerInvite,
    onSuccess: () => void invalidate(),
  });

  const updateSharing = useMutation({
    mutationFn: (settings: Partial<PartnerSharingSettings>) => updatePartnerSharing(settings),
    onSuccess: () => void invalidate(),
  });

  const pause = useMutation({
    mutationFn: pausePartnerSharing,
    onSuccess: () => void invalidate(),
  });

  const resume = useMutation({
    mutationFn: resumePartnerSharing,
    onSuccess: () => void invalidate(),
  });

  const revoke = useMutation({
    mutationFn: revokePartnerConnection,
    onSuccess: () => void invalidate(),
  });

  const cancelInvite = useMutation({
    mutationFn: cancelPartnerInvite,
    onSuccess: () => void invalidate(),
  });

  return { createInvite, updateSharing, pause, resume, revoke, cancelInvite };
}
