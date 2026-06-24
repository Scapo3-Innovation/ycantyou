-- ============================================================================
-- PCOS App — Module 7: content_bookmarks (saved articles)
-- Run in the Supabase SQL Editor (or via the migration tooling).
-- ============================================================================
-- Owner-only saved articles. DPDP: minimal, user-scoped, cascades on delete of
-- either the user or the article. RLS restricts every row to its owner.
-- ============================================================================

create table public.content_bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  article_id  uuid not null references public.content_articles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, article_id)
);

create index idx_bookmarks_user on public.content_bookmarks(user_id, created_at desc);

alter table public.content_bookmarks enable row level security;

create policy "bookmarks_owner" on public.content_bookmarks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- END
-- ============================================================================
