-- ============================================================================
-- PCOS App — profile avatar preset (9 pre-generated choices)
-- Safe to re-run.
-- ============================================================================

alter table public.profiles
  add column if not exists avatar_id text;

alter table public.profiles
  drop constraint if exists profiles_avatar_id_check;

alter table public.profiles
  add constraint profiles_avatar_id_check check (
    avatar_id is null
    or avatar_id in (
      'bloom', 'leaf', 'moon', 'sun', 'droplet',
      'heart', 'star', 'sparkle', 'clover'
    )
  );

-- ============================================================================
-- END
-- ============================================================================
