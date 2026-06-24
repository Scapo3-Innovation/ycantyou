-- Pending schema patch for dev Supabase projects created before migration 0006.
-- Run in SQL Editor: Dashboard → SQL → New query → paste → Run.
-- Safe to re-run (idempotent).

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

-- Reload PostgREST schema cache so the API sees the new column immediately.
notify pgrst, 'reload schema';
