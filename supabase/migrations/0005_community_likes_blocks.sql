-- ============================================================================
-- PCOS App — Module 8a: community likes + blocks
-- Run AFTER 0001 in the Supabase SQL Editor.
-- ============================================================================

-- ── Likes: all signed-in users can read; you write only your own ────────────
create table public.community_likes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.community_posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
create index idx_likes_post on public.community_likes(post_id);
create index idx_likes_user on public.community_likes(user_id);

alter table public.community_likes enable row level security;
create policy "likes_read"   on public.community_likes for select to authenticated using (true);
create policy "likes_insert" on public.community_likes for insert to authenticated with check (user_id = auth.uid());
create policy "likes_delete" on public.community_likes for delete to authenticated using (user_id = auth.uid());

-- ── Blocks: owner-only (you only ever see/write your own block list) ─────────
create table public.community_blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid not null references public.profiles(id) on delete cascade,
  blocked_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index idx_blocks_blocker on public.community_blocks(blocker_id);

alter table public.community_blocks enable row level security;
create policy "blocks_owner" on public.community_blocks
  for all using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

-- ============================================================================
-- END
-- ============================================================================
