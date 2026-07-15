-- ============================================================================
-- User feedback & bug reports (Settings → Help)
-- ============================================================================
-- SECURITY:
--   * RLS enabled — users can insert and read only their own rows.
--   * No client UPDATE/DELETE; team reviews via Supabase dashboard (service role).
--   * Do not store health data in message — UI copy reminds users.
-- ============================================================================

create table public.user_feedback (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  kind          text not null check (kind in ('bug', 'feedback')),
  message       text not null check (char_length(trim(message)) >= 10),
  app_version   text,
  platform      text check (platform in ('ios', 'android', 'web')),
  device_model  text,
  created_at    timestamptz not null default now()
);

create index idx_user_feedback_user_created
  on public.user_feedback (user_id, created_at desc);

create index idx_user_feedback_kind_created
  on public.user_feedback (kind, created_at desc);

alter table public.user_feedback enable row level security;

create policy "user_feedback_insert_own"
  on public.user_feedback
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user_feedback_select_own"
  on public.user_feedback
  for select
  to authenticated
  using (user_id = auth.uid());

comment on table public.user_feedback is
  'In-app bug reports and product feedback submitted from Settings.';
