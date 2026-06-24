import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';

import {
  fetchArticleBySlug,
  fetchArticlesByCategory,
  fetchBookmarkIds,
  fetchBookmarkedArticles,
  fetchCategories,
  searchArticles,
} from './api';
import { useContentLanguage } from './language';

/** Query keys for the content feature. */
export const contentKeys = {
  categories: (lang: string) => ['content', 'categories', lang] as const,
  articles: (categoryId: string, lang: string) =>
    ['content', 'articles', categoryId, lang] as const,
  article: (slug: string, lang: string) => ['content', 'article', slug, lang] as const,
  search: (q: string, lang: string) => ['content', 'search', q, lang] as const,
  bookmarkIds: (userId: string | undefined) => ['content', 'bookmark-ids', userId] as const,
  bookmarks: (userId: string | undefined, lang: string) =>
    ['content', 'bookmarks', userId, lang] as const,
};

export function useCategories() {
  const lang = useContentLanguage();
  return useQuery({
    queryKey: contentKeys.categories(lang),
    queryFn: () => fetchCategories(lang),
    staleTime: 5 * 60_000,
  });
}

export function useArticlesByCategory(categoryId: string) {
  const lang = useContentLanguage();
  return useQuery({
    queryKey: contentKeys.articles(categoryId, lang),
    queryFn: () => fetchArticlesByCategory(categoryId, lang),
    enabled: Boolean(categoryId),
  });
}

export function useArticle(slug: string) {
  const lang = useContentLanguage();
  return useQuery({
    queryKey: contentKeys.article(slug, lang),
    queryFn: () => fetchArticleBySlug(slug, lang),
    enabled: Boolean(slug),
  });
}

export function useSearchArticles(query: string) {
  const lang = useContentLanguage();
  const term = query.trim();
  return useQuery({
    queryKey: contentKeys.search(term, lang),
    queryFn: () => searchArticles(term, lang),
    enabled: term.length >= 2,
  });
}

export function useBookmarkIds() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: contentKeys.bookmarkIds(userId),
    queryFn: () => fetchBookmarkIds(userId as string),
    enabled: Boolean(userId),
  });
}

export function useBookmarkedArticles() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const lang = useContentLanguage();
  return useQuery({
    queryKey: contentKeys.bookmarks(userId, lang),
    queryFn: () => fetchBookmarkedArticles(userId as string, lang),
    enabled: Boolean(userId),
  });
}
