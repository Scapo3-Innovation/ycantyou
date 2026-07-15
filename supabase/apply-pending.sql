-- Quick dev patch (legacy). Prefer: npm run db:patch
-- Applies migrations 0005–0009 from supabase/migrations/ automatically.
--
-- Manual fallback: run each file in supabase/migrations/ starting from
-- 0005_community_likes_blocks.sql through 0009_partner_session.sql
-- in the Supabase SQL Editor, then:
--   notify pgrst, 'reload schema';

-- Sex at birth (0006/0007) — idempotent
alter table public.profiles
  add column if not exists sex_assigned_at_birth text;

alter table public.profiles
  drop constraint if exists profiles_sex_assigned_at_birth_check;

alter table public.profiles
  add constraint profiles_sex_assigned_at_birth_check
  check (
    sex_assigned_at_birth is null
    or sex_assigned_at_birth in ('female', 'male', 'prefer_not_to_say')
  );

notify pgrst, 'reload schema';
