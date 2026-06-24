import { supabase } from '@/lib/supabase';
import type { ContentArticle, ContentCategory } from '@/types/database';

/**
 * Content data layer. Categories and published articles are publicly readable (RLS);
 * bookmarks are owner-only. Every read is scoped by `language` so more languages can be
 * added later by inserting rows — no screen changes needed.
 */

/** Categories for a language, in display order. */
export async function fetchCategories(language: string): Promise<ContentCategory[]> {
  const { data, error } = await supabase
    .from('content_categories')
    .select('*')
    .eq('language', language)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ContentCategory[];
}

/** Published articles in a category. */
export async function fetchArticlesByCategory(
  categoryId: string,
  language: string,
): Promise<ContentArticle[]> {
  const { data, error } = await supabase
    .from('content_articles')
    .select('*')
    .eq('category_id', categoryId)
    .eq('language', language)
    .eq('published', true)
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContentArticle[];
}

/** A single published article by slug. */
export async function fetchArticleBySlug(
  slug: string,
  language: string,
): Promise<ContentArticle | null> {
  const { data, error } = await supabase
    .from('content_articles')
    .select('*')
    .eq('slug', slug)
    .eq('language', language)
    .eq('published', true)
    .maybeSingle();
  if (error) throw error;
  return (data as ContentArticle | null) ?? null;
}

/** Remove characters that would break PostgREST's `or` filter grammar. */
function sanitize(query: string): string {
  return query.replace(/[,()%*\\]/g, ' ').trim();
}

/** Search published articles by title or body. */
export async function searchArticles(
  query: string,
  language: string,
): Promise<ContentArticle[]> {
  const term = sanitize(query);
  if (term.length < 2) return [];
  const pattern = `%${term}%`;
  const { data, error } = await supabase
    .from('content_articles')
    .select('*')
    .eq('language', language)
    .eq('published', true)
    .or(`title.ilike.${pattern},body.ilike.${pattern}`)
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContentArticle[];
}

/** Article ids the user has bookmarked (for quick membership checks). */
export async function fetchBookmarkIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('content_bookmarks')
    .select('article_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((row) => (row as { article_id: string }).article_id);
}

/** The user's bookmarked articles (newest first), scoped to the current language. */
export async function fetchBookmarkedArticles(
  userId: string,
  language: string,
): Promise<ContentArticle[]> {
  const { data, error } = await supabase
    .from('content_bookmarks')
    .select('created_at, content_articles(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as unknown as { content_articles: ContentArticle | null }[];
  return rows
    .map((row) => row.content_articles)
    .filter((a): a is ContentArticle => a != null && a.published && a.language === language);
}

/** Save an article. */
export async function addBookmark(userId: string, articleId: string): Promise<void> {
  const { error } = await supabase
    .from('content_bookmarks')
    .insert({ user_id: userId, article_id: articleId });
  if (error) throw error;
}

/** Remove a saved article. */
export async function removeBookmark(userId: string, articleId: string): Promise<void> {
  const { error } = await supabase
    .from('content_bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('article_id', articleId);
  if (error) throw error;
}
