import { QueryClient } from '@tanstack/react-query';

/**
 * Shared TanStack Query client. Provided at the app root (see app/_layout.tsx).
 *
 * `gcTime` is long so cached reads survive for offline use; `networkMode: 'offlineFirst'`
 * lets queries serve cached data when there's no connection. Only PUBLIC content is
 * persisted to disk (see lib/persister.ts) — health/personal data is never written to
 * unencrypted storage.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      retry: 2,
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst',
    },
  },
});
