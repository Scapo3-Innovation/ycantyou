-- Admin audit log for testing dashboard destructive actions (service role only writes).

create table if not exists public.admin_audit_log (
  id              uuid primary key default gen_random_uuid(),
  admin_user_id   uuid references auth.users(id) on delete set null,
  action          text not null,
  target_user_id  uuid references auth.users(id) on delete set null,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_admin_audit_log_created
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

-- No policies: only service role (admin app server) can read/write.

comment on table public.admin_audit_log is
  'Testing admin dashboard actions — not exposed to mobile clients.';
