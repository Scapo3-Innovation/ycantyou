import { useQuery } from '@tanstack/react-query';

import { fetchProfile } from './api';

/** Stable query key for the current user's profile. */
export function profileQueryKey(userId: string | undefined) {
  return ['profile', userId] as const;
}

/**
 * Load the signed-in user's profile. Disabled until a userId is known so it stays
 * idle (not loading) while signed out.
 */
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileQueryKey(userId),
    queryFn: () => fetchProfile(userId as string),
    enabled: Boolean(userId),
    staleTime: 60_000,
    retry: 1,
  });
}
