-- Drop intersex from allowed sex_assigned_at_birth values.
alter table public.profiles
  drop constraint if exists profiles_sex_assigned_at_birth_check;

alter table public.profiles
  add constraint profiles_sex_assigned_at_birth_check
  check (
    sex_assigned_at_birth is null
    or sex_assigned_at_birth in ('female', 'male', 'prefer_not_to_say')
  );
