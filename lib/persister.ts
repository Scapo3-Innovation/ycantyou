import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultShouldDehydrateQuery, type Query } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

/**
 * Offline cache persistence.
 *
 * IMPORTANT (DPDP / encryption-at-rest): we ONLY persist PUBLIC educational content
 * (categories + articles) to AsyncStorage, which is not encrypted. Health and personal
 * data (cycles, daily logs, screener, community, profile, bookmarks) is deliberately NOT
 * written to disk — it stays in memory and refetches when online.
 */

const MAX_AGE = 24 * 60 * 60 * 1000; // 24h

/** Allow only public-content queries to be written to disk. */
function isPublicContent(query: Query): boolean {
  const key = query.queryKey;
  return (
    Array.isArray(key) &&
    key[0] === 'content' &&
    (key[1] === 'categories' || key[1] === 'article' || key[1] === 'articles')
  );
}

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'pcos-rq-cache',
});

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: asyncStoragePersister,
  maxAge: MAX_AGE,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      defaultShouldDehydrateQuery(query) && isPublicContent(query),
  },
};
