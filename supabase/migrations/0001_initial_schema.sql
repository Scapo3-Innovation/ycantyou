-- ============================================================================
-- PCOS App — Module 2: Initial Schema + Row-Level Security
-- Run in Supabase SQL Editor (or save to supabase/migrations/0001_initial_schema.sql)
-- ============================================================================
-- SECURITY MODEL (read this):
--   * RLS is enabled on EVERY table.
--   * User-owned tables: a user can only read/write rows where user_id = auth.uid().
--   * Lookup tables (symptoms, screener_questions): readable by signed-in users; only
--     the service role (server-side) can write them.
--   * Content: published rows are publicly readable (for the future website/SEO).
--   * Community: signed-in users read all non-deleted rows, write only their own.
-- ============================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ---------- Shared: updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ============================================================================
-- PROFILES  (1:1 with auth.users)
-- ============================================================================
create table public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  full_name          text,
  dob                date,
  language           text not null default 'en',
  goal               text check (goal in ('cycle','fertility','symptoms','weight','mood')),
  onboarding_status  text not null default 'pending' check (onboarding_status in ('pending','completed')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- CONSENTS  (versioned, for DPDP)
-- ============================================================================
create table public.consents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  consent_type  text not null,                 -- e.g. 'health_data','terms','privacy'
  version       text not null,                 -- the policy version they agreed to
  granted_at    timestamptz not null default now(),
  revoked_at    timestamptz
);

-- ============================================================================
-- CYCLES
-- ============================================================================
create table public.cycles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  start_date    date not null,
  end_date      date,
  is_predicted  boolean not null default false,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create trigger trg_cycles_updated before update on public.cycles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- DAILY LOGS  (one per user per day)
-- ============================================================================
create table public.daily_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  log_date    date not null,
  flow_level  text check (flow_level in ('none','spotting','light','medium','heavy')),
  mood        smallint check (mood between 1 and 5),
  energy      smallint check (energy between 1 and 5),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  unique (user_id, log_date)
);
create trigger trg_daily_logs_updated before update on public.daily_logs
  for each row execute function public.set_updated_at();

-- ---------- Symptoms (lookup) ----------
create table public.symptoms (
  code      text primary key,        -- e.g. 'acne','hair_loss'
  label     text not null,
  category  text                     -- e.g. 'skin','hair','mood','cycle'
);

-- ---------- Daily log <-> symptoms (join) ----------
create table public.daily_log_symptoms (
  id            uuid primary key default gen_random_uuid(),
  daily_log_id  uuid not null references public.daily_logs(id) on delete cascade,
  symptom_code  text not null references public.symptoms(code),
  severity      smallint check (severity between 1 and 3),
  unique (daily_log_id, symptom_code)
);

-- ============================================================================
-- LAB RESULTS  (optional metabolic tracking)
-- ============================================================================
create table public.lab_results (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  test_type   text not null,         -- e.g. 'fasting_insulin','hba1c','testosterone','amh'
  value       numeric,
  unit        text,
  taken_on    date,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ============================================================================
-- SCREENER
-- ============================================================================
create table public.screener_questions (
  id        uuid primary key default gen_random_uuid(),
  code      text unique not null,    -- stable code referenced by responses
  text      text not null,
  category  text,
  weight    numeric not null default 1,
  sort_order integer not null default 0,
  active    boolean not null default true
);

create table public.screener_responses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  session_id    uuid not null,       -- groups one screening attempt
  question_code text not null references public.screener_questions(code),
  answer_bool   boolean,             -- checklist style (present / not)
  answer_num    numeric,             -- for future scale-type questions
  created_at    timestamptz not null default now()
);

create table public.screener_results (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  session_id  uuid unique not null,
  score       numeric not null,
  risk_band   text not null check (risk_band in ('low','moderate','high')),
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- CONTENT (education hub)
-- ============================================================================
create table public.content_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  language    text not null default 'en',
  sort_order  integer not null default 0
);

create table public.content_articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  body          text,
  language      text not null default 'en',
  category_id   uuid references public.content_categories(id) on delete set null,
  published     boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_articles_updated before update on public.content_articles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- COMMUNITY
-- ============================================================================
create table public.community_posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text,
  body        text not null,
  tags        text[] default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create trigger trg_posts_updated before update on public.community_posts
  for each row execute function public.set_updated_at();

create table public.community_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.community_posts(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table public.community_reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  post_id      uuid references public.community_posts(id) on delete cascade,
  comment_id   uuid references public.community_comments(id) on delete cascade,
  reason       text,
  status       text not null default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at   timestamptz not null default now()
);

-- ============================================================================
-- INDEXES  (hot columns: user_id, dates, foreign keys, slugs)
-- ============================================================================
create index idx_consents_user            on public.consents(user_id);
create index idx_cycles_user_date         on public.cycles(user_id, start_date desc);
create index idx_daily_logs_user_date     on public.daily_logs(user_id, log_date desc);
create index idx_dls_log                  on public.daily_log_symptoms(daily_log_id);
create index idx_lab_user                 on public.lab_results(user_id, taken_on desc);
create index idx_sresp_user_session       on public.screener_responses(user_id, session_id);
create index idx_sresult_user             on public.screener_results(user_id, created_at desc);
create index idx_articles_published       on public.content_articles(published, published_at desc);
create index idx_articles_category        on public.content_articles(category_id);
create index idx_posts_created            on public.community_posts(created_at desc) where deleted_at is null;
create index idx_comments_post            on public.community_comments(post_id) where deleted_at is null;
create index idx_reports_status           on public.community_reports(status);

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================
alter table public.profiles            enable row level security;
alter table public.consents            enable row level security;
alter table public.cycles              enable row level security;
alter table public.daily_logs          enable row level security;
alter table public.symptoms            enable row level security;
alter table public.daily_log_symptoms  enable row level security;
alter table public.lab_results         enable row level security;
alter table public.screener_questions  enable row level security;
alter table public.screener_responses  enable row level security;
alter table public.screener_results    enable row level security;
alter table public.content_categories  enable row level security;
alter table public.content_articles    enable row level security;
alter table public.community_posts     enable row level security;
alter table public.community_comments  enable row level security;
alter table public.community_reports   enable row level security;

-- ---- PROFILES: a user sees/edits only their own ----
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- ---- Generic owner-only tables ----
create policy "consents_owner"   on public.consents   for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cycles_owner"     on public.cycles     for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "daily_logs_owner" on public.daily_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "lab_owner"        on public.lab_results for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "sresp_owner"      on public.screener_responses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "sresult_owner"    on public.screener_results   for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- daily_log_symptoms: ownership via parent daily_log ----
create policy "dls_owner" on public.daily_log_symptoms for all
  using (exists (select 1 from public.daily_logs dl where dl.id = daily_log_id and dl.user_id = auth.uid()))
  with check (exists (select 1 from public.daily_logs dl where dl.id = daily_log_id and dl.user_id = auth.uid()));

-- ---- Lookups: signed-in users can read; only service role writes ----
create policy "symptoms_read"   on public.symptoms          for select to authenticated using (true);
create policy "questions_read"  on public.screener_questions for select to authenticated using (active = true);

-- ---- Content: published rows readable by everyone (anon + authenticated) ----
create policy "categories_read" on public.content_categories for select using (true);
create policy "articles_read"   on public.content_articles   for select using (published = true);

-- ---- Community: read all non-deleted; write only your own ----
create policy "posts_read"      on public.community_posts for select to authenticated using (deleted_at is null);
create policy "posts_insert"    on public.community_posts for insert to authenticated with check (user_id = auth.uid());
create policy "posts_update_own"on public.community_posts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "comments_read"      on public.community_comments for select to authenticated using (deleted_at is null);
create policy "comments_insert"    on public.community_comments for insert to authenticated with check (user_id = auth.uid());
create policy "comments_update_own"on public.community_comments for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "reports_insert"  on public.community_reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "reports_select_own" on public.community_reports for select to authenticated using (reporter_id = auth.uid());

-- ============================================================================
-- SEED DATA  (lookup/static only — no users)
-- ============================================================================
insert into public.symptoms (code, label, category) values
  ('acne','Persistent acne','skin'),
  ('hair_loss','Noticeable hair loss','hair'),
  ('hirsutism_face','Thick dark hair on chin/upper lip','hair'),
  ('hirsutism_body','Thick dark hair on arms/legs/chest','hair'),
  ('bloating','Regular bloating','digestive'),
  ('fatigue','Regular fatigue','energy'),
  ('low_mood','Regularly low mood','mood'),
  ('anxiety','Regular anxiety','mood'),
  ('mood_swings','Mood swings','mood'),
  ('dark_patches','Dark velvety skin patches','skin'),
  ('spotting','Spotting between periods','cycle'),
  ('low_libido','Persistent low sex drive','sexual_health')
on conflict (code) do nothing;

insert into public.screener_questions (code, text, category, weight, sort_order) values
  ('no_period_3m','No period for 3 months or more','cycle',3,1),
  ('irregular_cycle','Cycle length varies by 8+ days','cycle',2,2),
  ('short_cycle','Some cycles last 20 days or less','cycle',1,3),
  ('long_cycle','Some cycles last 36 days or more','cycle',2,4),
  ('long_period','Some periods last 8 days or longer','cycle',1,5),
  ('hirsutism','Excess thick/dark hair (face, chest, etc.)','androgen',3,6),
  ('acne','Persistent acne','androgen',2,7),
  ('hair_loss','Noticeable scalp hair loss','androgen',2,8),
  ('dark_patches','Patches of thick, dark, velvety skin','metabolic',2,9),
  ('bmi_25','BMI of 25 or above','metabolic',1,10),
  ('increased_appetite','Increased appetite / cravings','metabolic',1,11),
  ('family_history','Family history of PCOS','history',2,12)
on conflict (code) do nothing;

insert into public.content_categories (slug, name, sort_order) values
  ('basics','PCOS Basics',1),
  ('nutrition','Nutrition & Diet',2),
  ('movement','Movement & Exercise',3),
  ('mental_health','Mental Health',4),
  ('myths','Myth-busting',5)
on conflict (slug) do nothing;

-- ============================================================================
-- END
-- ============================================================================