import { QueryClient } from '@tanstack/react-query';

/**
 * Shared TanStack Query client. Provided at the app root (see app/_layout.tsx).
 * Defaults are conservative; individual queries can override as needed.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
