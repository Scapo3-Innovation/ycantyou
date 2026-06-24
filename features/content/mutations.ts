import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';

import { addBookmark, removeBookmark } from './api';
import { contentKeys } from './queries';

/** Toggle a bookmark with an optimistic update of the cached id set. */
export function useToggleBookmark() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const idsKey = contentKeys.bookmarkIds(userId);

  return useMutation({
    mutationFn: ({ articleId, bookmarked }: { articleId: string; bookmarked: boolean }) =>
      bookmarked
        ? removeBookmark(userId as string, articleId)
        : addBookmark(userId as string, articleId),
    onMutate: async ({ articleId, bookmarked }) => {
      await qc.cancelQueries({ queryKey: idsKey });
      const prev = qc.getQueryData<string[]>(idsKey) ?? [];
      const next = bookmarked ? prev.filter((id) => id !== articleId) : [...prev, articleId];
      qc.setQueryData(idsKey, next);
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(idsKey, ctx.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: idsKey });
      // Prefix-match the bookmarked-articles list across languages.
      void qc.invalidateQueries({ queryKey: ['content', 'bookmarks', userId] });
    },
  });
}
