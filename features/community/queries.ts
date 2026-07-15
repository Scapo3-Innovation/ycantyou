import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import { isSchemaNotReadyError } from '@/lib/supabaseErrors';

import { fetchFeed, fetchPostDetail } from './api';

export const communityKeys = {
  feed: (userId: string | undefined) => ['community', 'feed', userId] as const,
  post: (postId: string, userId: string | undefined) =>
    ['community', 'post', postId, userId] as const,
};

export function useFeed() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: communityKeys.feed(userId),
    queryFn: () => fetchFeed(userId as string),
    enabled: Boolean(userId),
    staleTime: 0,
    retry: (failureCount, error) => {
      if (isSchemaNotReadyError(error)) return false;
      return failureCount < 2;
    },
  });
}

export function usePostDetail(postId: string) {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: communityKeys.post(postId, userId),
    queryFn: () => fetchPostDetail(postId, userId as string),
    enabled: Boolean(userId) && Boolean(postId),
  });
}
