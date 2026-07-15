-- ============================================================================
-- PCOS App — Module 8b: anonymous posts, dislikes, comment likes, trusted badge
-- Run AFTER 0005 in the Supabase SQL Editor.
-- FLAG FOR HUMAN REVIEW before applying to production.
-- ============================================================================

-- ── Optional anonymity per post/comment ───────────────────────────────────────
alter table public.community_posts
  add column if not exists is_anonymous boolean not null default true;

alter table public.community_comments
  add column if not exists is_anonymous boolean not null default true;

-- ── Post dislikes ───────────────────────────────────────────────────────────
create table if not exists public.community_dislikes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.community_posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
create index if not exists idx_dislikes_post on public.community_dislikes(post_id);
create index if not exists idx_dislikes_user on public.community_dislikes(user_id);

alter table public.community_dislikes enable row level security;
drop policy if exists "dislikes_read" on public.community_dislikes;
create policy "dislikes_read" on public.community_dislikes for select to authenticated using (true);
drop policy if exists "dislikes_insert" on public.community_dislikes;
create policy "dislikes_insert" on public.community_dislikes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "dislikes_delete" on public.community_dislikes;
create policy "dislikes_delete" on public.community_dislikes for delete to authenticated using (user_id = auth.uid());

-- ── Comment likes (for helpful-member badge) ──────────────────────────────────
create table if not exists public.community_comment_likes (
  id         uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.community_comments(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);
create index if not exists idx_comment_likes_comment on public.community_comment_likes(comment_id);
create index if not exists idx_comment_likes_user on public.community_comment_likes(user_id);

alter table public.community_comment_likes enable row level security;
drop policy if exists "comment_likes_read" on public.community_comment_likes;
create policy "comment_likes_read" on public.community_comment_likes for select to authenticated using (true);
drop policy if exists "comment_likes_insert" on public.community_comment_likes;
create policy "comment_likes_insert" on public.community_comment_likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "comment_likes_delete" on public.community_comment_likes;
create policy "comment_likes_delete" on public.community_comment_likes for delete to authenticated using (user_id = auth.uid());

-- ── Per-user community stats (trusted contributor) ────────────────────────────
create table if not exists public.community_profiles (
  user_id                  uuid primary key references public.profiles(id) on delete cascade,
  helpful_likes_received   int not null default 0 check (helpful_likes_received >= 0),
  comment_count            int not null default 0 check (comment_count >= 0),
  is_trusted_contributor   boolean not null default false,
  trusted_at               timestamptz,
  updated_at               timestamptz not null default now()
);

alter table public.community_profiles enable row level security;
drop policy if exists "community_profiles_read" on public.community_profiles;
create policy "community_profiles_read" on public.community_profiles for select to authenticated using (true);

-- Thresholds for trusted badge (v1)
-- helpful_likes_received >= 20 AND comment_count >= 5

create or replace function public.community_refresh_trusted(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_profiles
  set
    is_trusted_contributor = (helpful_likes_received >= 20 and comment_count >= 5),
    trusted_at = case
      when helpful_likes_received >= 20 and comment_count >= 5 and trusted_at is null then now()
      else trusted_at
    end,
    updated_at = now()
  where user_id = p_user_id;
end;
$$;

create or replace function public.community_on_comment_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.community_profiles (user_id, comment_count)
  values (new.user_id, 1)
  on conflict (user_id) do update
    set comment_count = community_profiles.comment_count + 1,
        updated_at = now();
  perform public.community_refresh_trusted(new.user_id);
  return new;
end;
$$;

drop trigger if exists trg_community_comment_insert on public.community_comments;
create trigger trg_community_comment_insert
  after insert on public.community_comments
  for each row execute function public.community_on_comment_insert();

create or replace function public.community_on_comment_like_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author_id uuid;
begin
  if tg_op = 'INSERT' then
    select user_id into author_id from public.community_comments where id = new.comment_id;
    if author_id is null then return new; end if;
    insert into public.community_profiles (user_id, helpful_likes_received)
    values (author_id, 1)
    on conflict (user_id) do update
      set helpful_likes_received = community_profiles.helpful_likes_received + 1,
          updated_at = now();
    perform public.community_refresh_trusted(author_id);
    return new;
  elsif tg_op = 'DELETE' then
    select user_id into author_id from public.community_comments where id = old.comment_id;
    if author_id is null then return old; end if;
    update public.community_profiles
    set helpful_likes_received = greatest(0, helpful_likes_received - 1),
        updated_at = now()
    where user_id = author_id;
    perform public.community_refresh_trusted(author_id);
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_community_comment_like_insert on public.community_comment_likes;
create trigger trg_community_comment_like_insert
  after insert on public.community_comment_likes
  for each row execute function public.community_on_comment_like_change();

drop trigger if exists trg_community_comment_like_delete on public.community_comment_likes;
create trigger trg_community_comment_like_delete
  after delete on public.community_comment_likes
  for each row execute function public.community_on_comment_like_change();

-- ============================================================================
-- END
-- ============================================================================
