-- Sex assigned at birth (optional on existing rows; collected during onboarding).
alter table public.profiles
  add column sex_assigned_at_birth text
  check (
    sex_assigned_at_birth is null
    or sex_assigned_at_birth in ('female', 'male', 'prefer_not_to_say')
  );
