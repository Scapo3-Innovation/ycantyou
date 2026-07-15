-- ============================================================================
-- PCOS App — Partner Session (consent-first partner linking)
-- HUMAN REVIEW REQUIRED: auth, RLS, consent, health-data sharing
-- ============================================================================

-- ---------- profiles.account_mode ----------
alter table public.profiles
  add column if not exists account_mode text not null default 'primary'
    check (account_mode in ('primary', 'partner'));

-- ---------- Default sharing settings helper ----------
create or replace function public.default_partner_sharing_settings()
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_build_object(
    'cycle_phase', true,
    'period_dates', true,
    'predictions', true,
    'fertile_window', false,
    'mood_energy_summary', false,
    'symptoms_summary', false,
    'daily_notes', false,
    'screener_summary', false
  );
$$;

-- ---------- partner_invites ----------
create table public.partner_invites (
  id               uuid primary key default gen_random_uuid(),
  primary_user_id  uuid not null references public.profiles(id) on delete cascade,
  code             text not null unique,
  expires_at       timestamptz not null,
  redeemed_at      timestamptz,
  redeemed_by      uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now()
);

create index idx_partner_invites_primary on public.partner_invites(primary_user_id);
create index idx_partner_invites_code on public.partner_invites(code);

-- ---------- partner_connections ----------
create table public.partner_connections (
  id               uuid primary key default gen_random_uuid(),
  primary_user_id  uuid not null unique references public.profiles(id) on delete cascade,
  partner_user_id  uuid not null unique references public.profiles(id) on delete cascade,
  status           text not null default 'active'
    check (status in ('active', 'paused', 'revoked')),
  sharing_settings jsonb not null default public.default_partner_sharing_settings(),
  connected_at     timestamptz not null default now(),
  revoked_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (primary_user_id <> partner_user_id)
);

create trigger trg_partner_connections_updated
  before update on public.partner_connections
  for each row execute function public.set_updated_at();

create index idx_partner_connections_partner on public.partner_connections(partner_user_id);

-- ---------- RLS ----------
alter table public.partner_invites enable row level security;
alter table public.partner_connections enable row level security;

create policy "partner_invites_primary_select"
  on public.partner_invites for select to authenticated
  using (primary_user_id = auth.uid());

create policy "partner_invites_primary_insert"
  on public.partner_invites for insert to authenticated
  with check (primary_user_id = auth.uid());

create policy "partner_connections_primary"
  on public.partner_connections for select to authenticated
  using (primary_user_id = auth.uid());

create policy "partner_connections_primary_update"
  on public.partner_connections for update to authenticated
  using (primary_user_id = auth.uid())
  with check (primary_user_id = auth.uid());

create policy "partner_connections_partner_select"
  on public.partner_connections for select to authenticated
  using (partner_user_id = auth.uid());

-- ---------- Internal helpers (not exposed to client) ----------
create or replace function public._generate_partner_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
  attempts int := 0;
begin
  loop
    result := '';
    for i in 1..6 loop
      result := result || substr(chars, (floor(random() * length(chars))::int + 1), 1);
    end loop;
    exit when not exists (select 1 from public.partner_invites where code = result);
    attempts := attempts + 1;
    if attempts > 20 then
      raise exception 'Could not generate unique partner code';
    end if;
  end loop;
  return result;
end;
$$;

create or replace function public._partner_connection_for_partner()
returns public.partner_connections
language sql
stable
security definer
set search_path = ''
as $$
  select *
  from public.partner_connections
  where partner_user_id = auth.uid()
    and status in ('active', 'paused')
  limit 1;
$$;

create or replace function public._partner_connection_for_primary()
returns public.partner_connections
language sql
stable
security definer
set search_path = ''
as $$
  select *
  from public.partner_connections
  where primary_user_id = auth.uid()
    and status in ('active', 'paused')
  limit 1;
$$;

-- Simple cycle-length stats for partner dashboard (mirrors client prediction.ts)
create or replace function public._partner_cycle_stats(p_user_id uuid, window_size int default 6)
returns table (n_cycles int, avg_length int, spread int, last_start date)
language sql
stable
security definer
set search_path = ''
as $$
  with starts as (
    select start_date,
           lead(start_date) over (order by start_date) as next_start
    from public.cycles
    where user_id = p_user_id
      and deleted_at is null
      and is_predicted = false
  ),
  lengths as (
    select (next_start - start_date) as len, start_date
    from starts
    where next_start is not null and (next_start - start_date) > 0
    order by start_date desc
    limit window_size
  )
  select count(*)::int,
         coalesce(round(avg(len))::int, 0),
         coalesce((max(len) - min(len))::int, 0),
         (select max(start_date) from public.cycles
          where user_id = p_user_id and deleted_at is null and is_predicted = false)
  from lengths;
$$;

-- ---------- create_partner_invite ----------
create or replace function public.create_partner_invite()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  new_code text;
  invite_row public.partner_invites;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if exists (
    select 1 from public.profiles
    where id = uid and account_mode = 'partner'
  ) then
    raise exception 'Partner accounts cannot create invites';
  end if;

  if exists (
    select 1 from public.partner_connections
    where primary_user_id = uid and status in ('active', 'paused')
  ) then
    raise exception 'You already have a linked partner';
  end if;

  update public.partner_invites
  set redeemed_at = now()
  where primary_user_id = uid and redeemed_at is null;

  new_code := public._generate_partner_code();

  insert into public.partner_invites (primary_user_id, code, expires_at)
  values (uid, new_code, now() + interval '7 days')
  returning * into invite_row;

  return jsonb_build_object(
    'code', invite_row.code,
    'expires_at', invite_row.expires_at
  );
end;
$$;

-- ---------- redeem_partner_code ----------
create or replace function public.redeem_partner_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  normalized text := upper(trim(p_code));
  inv public.partner_invites;
  conn public.partner_connections;
  primary_name text;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if normalized is null or length(normalized) <> 6 then
    raise exception 'Invalid code';
  end if;

  if exists (
    select 1 from public.partner_connections
    where partner_user_id = uid and status in ('active', 'paused')
  ) then
    raise exception 'You are already linked to a partner';
  end if;

  select * into inv
  from public.partner_invites
  where code = normalized
    and redeemed_at is null
    and expires_at > now()
  for update;

  if inv.id is null then
    raise exception 'Invalid or expired code';
  end if;

  if inv.primary_user_id = uid then
    raise exception 'You cannot link to yourself';
  end if;

  if exists (
    select 1 from public.partner_connections
    where primary_user_id = inv.primary_user_id and status in ('active', 'paused')
  ) then
    raise exception 'This partner already has a linked account';
  end if;

  update public.partner_invites
  set redeemed_at = now(), redeemed_by = uid
  where id = inv.id;

  insert into public.partner_connections (primary_user_id, partner_user_id, sharing_settings)
  values (inv.primary_user_id, uid, public.default_partner_sharing_settings())
  returning * into conn;

  update public.profiles
  set account_mode = 'partner'
  where id = uid;

  select coalesce(full_name, 'Partner') into primary_name
  from public.profiles where id = inv.primary_user_id;

  return jsonb_build_object(
    'connection_id', conn.id,
    'primary_user_id', conn.primary_user_id,
    'primary_name', primary_name
  );
end;
$$;

-- ---------- update_partner_sharing ----------
create or replace function public.update_partner_sharing(p_settings jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  conn public.partner_connections;
  merged jsonb;
  keys text[] := array[
    'cycle_phase', 'period_dates', 'predictions', 'fertile_window',
    'mood_energy_summary', 'symptoms_summary', 'daily_notes', 'screener_summary'
  ];
  k text;
begin
  if uid is null then raise exception 'Not authenticated'; end if;

  select * into conn
  from public.partner_connections
  where primary_user_id = uid and status in ('active', 'paused');

  if conn.id is null then
    raise exception 'No active partner connection';
  end if;

  merged := public.default_partner_sharing_settings();
  foreach k in array keys loop
    if p_settings ? k then
      merged := jsonb_set(merged, array[k], to_jsonb((p_settings ->> k)::boolean));
    else
      merged := jsonb_set(merged, array[k], conn.sharing_settings -> k);
    end if;
  end loop;

  update public.partner_connections
  set sharing_settings = merged
  where id = conn.id;

  return merged;
end;
$$;

-- ---------- pause / revoke ----------
create or replace function public.pause_partner_sharing()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.partner_connections
  set status = 'paused'
  where primary_user_id = auth.uid() and status = 'active';
  if not found then raise exception 'No active connection'; end if;
end;
$$;

create or replace function public.resume_partner_sharing()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.partner_connections
  set status = 'active'
  where primary_user_id = auth.uid() and status = 'paused';
  if not found then raise exception 'No paused connection'; end if;
end;
$$;

create or replace function public.revoke_partner_connection()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  conn public.partner_connections;
begin
  select * into conn
  from public.partner_connections
  where primary_user_id = auth.uid() and status in ('active', 'paused');

  if conn.id is null then raise exception 'No connection to revoke'; end if;

  update public.partner_connections
  set status = 'revoked', revoked_at = now()
  where id = conn.id;

  update public.profiles
  set account_mode = 'primary'
  where id = conn.partner_user_id;
end;
$$;

create or replace function public.disconnect_as_partner()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  conn public.partner_connections;
begin
  select * into conn
  from public.partner_connections
  where partner_user_id = auth.uid() and status in ('active', 'paused');

  if conn.id is null then raise exception 'No connection'; end if;

  update public.partner_connections
  set status = 'revoked', revoked_at = now()
  where id = conn.id;

  update public.profiles
  set account_mode = 'primary', onboarding_status = 'pending', goal = null
  where id = auth.uid();
end;
$$;

-- ---------- get_partner_dashboard ----------
create or replace function public.get_partner_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  conn public.partner_connections;
  uid uuid := auth.uid();
  settings jsonb;
  primary_name text;
  partner_name text;
  today date := (timezone('utc', now()))::date;
  stats record;
  cycle_state jsonb := null;
  prediction jsonb := null;
  wellness jsonb := null;
  symptoms jsonb := null;
  screener_band text := null;
  containing record;
  day_index int;
  phase text;
  next_period jsonb := null;
  fertile jsonb := null;
  log_row record;
  mood_labels text[] := array['', 'Stressed', 'Not great', 'Okay', 'Good', 'Amazing'];
  energy_labels text[] := array['', 'Drained', 'Low', 'Moderate', 'Good', 'Energised'];
begin
  if uid is null then raise exception 'Not authenticated'; end if;

  select * into conn
  from public.partner_connections
  where partner_user_id = uid
  order by connected_at desc
  limit 1;

  if conn.id is null or conn.status = 'revoked' then
    return jsonb_build_object('status', 'none');
  end if;

  if conn.status = 'paused' then
    select coalesce(full_name, 'Her') into primary_name
    from public.profiles where id = conn.primary_user_id;
    return jsonb_build_object(
      'status', 'paused',
      'primary_name', primary_name
    );
  end if;

  settings := conn.sharing_settings;
  select coalesce(full_name, 'Her') into primary_name
  from public.profiles where id = conn.primary_user_id;
  select coalesce(full_name, 'Partner') into partner_name
  from public.profiles where id = uid;

  -- Cycle state (period containing today or cycle day)
  if (settings ->> 'cycle_phase')::boolean then
    select c.start_date, c.end_date into containing
    from public.cycles c
    where c.user_id = conn.primary_user_id
      and c.deleted_at is null
      and c.is_predicted = false
      and today >= c.start_date
      and today <= coalesce(c.end_date, c.start_date + 7)
    order by c.start_date desc
    limit 1;

    if containing.start_date is not null then
      cycle_state := jsonb_build_object(
        'kind', 'period',
        'day', (today - containing.start_date) + 1
      );
    else
      select * into stats from public._partner_cycle_stats(conn.primary_user_id);
      if stats.last_start is not null then
        day_index := today - stats.last_start;
        if stats.avg_length > 0 then
          if day_index < 5 then phase := 'menstrual';
          elsif day_index >= stats.avg_length - 15 and day_index <= stats.avg_length - 13 then phase := 'ovulation';
          elsif day_index > stats.avg_length - 13 then phase := 'luteal';
          else phase := 'follicular';
          end if;
        else
          phase := 'follicular';
        end if;
        cycle_state := jsonb_build_object(
          'kind', 'cycle',
          'day', day_index + 1,
          'phase', phase
        );
      end if;
    end if;
  end if;

  -- Predictions
  if (settings ->> 'predictions')::boolean or (settings ->> 'fertile_window')::boolean then
    select * into stats from public._partner_cycle_stats(conn.primary_user_id);
    if stats.n_cycles < 2 then
      prediction := jsonb_build_object('status', 'insufficient');
    elsif stats.spread > 7 then
      prediction := jsonb_build_object(
        'status', 'irregular',
        'avg_length', stats.avg_length,
        'spread', stats.spread,
        'basis', stats.n_cycles
      );
    else
      next_period := jsonb_build_object(
        'predicted_start', (stats.last_start + stats.avg_length)::text,
        'window_start', (stats.last_start + stats.avg_length - 2)::text,
        'window_end', (stats.last_start + stats.avg_length + 2)::text
      );
      if (settings ->> 'fertile_window')::boolean and stats.avg_length > 14 then
        fertile := jsonb_build_object(
          'ovulation', (stats.last_start + stats.avg_length - 14)::text,
          'start', (stats.last_start + stats.avg_length - 19)::text,
          'end', (stats.last_start + stats.avg_length - 12)::text
        );
      end if;
      prediction := jsonb_build_object(
        'status', 'regular',
        'avg_length', stats.avg_length,
        'basis', stats.n_cycles,
        'last_start', stats.last_start::text,
        'next_period', case when (settings ->> 'predictions')::boolean then next_period else null end,
        'fertile', fertile
      );
    end if;
  end if;

  -- Today's wellness
  if (settings ->> 'mood_energy_summary')::boolean then
    select mood, energy into log_row
    from public.daily_logs
    where user_id = conn.primary_user_id
      and log_date = today
      and deleted_at is null
    limit 1;
    if log_row.mood is not null or log_row.energy is not null then
      wellness := jsonb_build_object(
        'mood', case when log_row.mood is not null then mood_labels[log_row.mood] else null end,
        'energy', case when log_row.energy is not null then energy_labels[log_row.energy] else null end
      );
    end if;
  end if;

  -- Today's symptoms
  if (settings ->> 'symptoms_summary')::boolean then
    select coalesce(jsonb_agg(s.label order by s.label), '[]'::jsonb) into symptoms
    from public.daily_logs dl
    join public.daily_log_symptoms dls on dls.daily_log_id = dl.id
    join public.symptoms s on s.code = dls.symptom_code
    where dl.user_id = conn.primary_user_id
      and dl.log_date = today
      and dl.deleted_at is null;
  end if;

  -- Screener band
  if (settings ->> 'screener_summary')::boolean then
    select sr.risk_band into screener_band
    from public.screener_results sr
    where sr.user_id = conn.primary_user_id
    order by sr.created_at desc
    limit 1;
  end if;

  return jsonb_build_object(
    'status', 'active',
    'primary_name', primary_name,
    'partner_name', partner_name,
    'connected_at', conn.connected_at,
    'sharing_settings', settings,
    'today', today::text,
    'cycle_state', cycle_state,
    'prediction', prediction,
    'wellness_today', wellness,
    'symptoms_today', symptoms,
    'screener_band', screener_band
  );
end;
$$;

-- ---------- get_partner_calendar_range ----------
create or replace function public.get_partner_calendar_range(p_start date, p_end date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  conn public.partner_connections;
  settings jsonb;
  marks jsonb := '[]'::jsonb;
  stats record;
  c record;
  d date;
  pred_start date;
  pred_end date;
  fert_start date;
  fert_end date;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  select * into conn
  from public.partner_connections
  where partner_user_id = auth.uid() and status = 'active';

  if conn.id is null then
    return jsonb_build_object('marks', '[]'::jsonb, 'prediction_status', 'none');
  end if;

  settings := conn.sharing_settings;

  if (settings ->> 'period_dates')::boolean then
    for c in
      select start_date, coalesce(end_date, start_date + 7) as end_date
      from public.cycles
      where user_id = conn.primary_user_id
        and deleted_at is null
        and is_predicted = false
        and start_date <= p_end
        and coalesce(end_date, start_date + 7) >= p_start
    loop
      d := greatest(c.start_date, p_start);
      while d <= least(c.end_date, p_end) loop
        marks := marks || jsonb_build_array(jsonb_build_object('date', d::text, 'kind', 'period'));
        d := d + 1;
      end loop;
    end loop;
  end if;

  select * into stats from public._partner_cycle_stats(conn.primary_user_id);

  if (settings ->> 'predictions')::boolean and stats.n_cycles >= 2 and stats.spread <= 7 then
    pred_start := stats.last_start + stats.avg_length - 2;
    pred_end := stats.last_start + stats.avg_length + 2;
    d := greatest(pred_start, p_start);
    while d <= least(pred_end, p_end) loop
      marks := marks || jsonb_build_array(jsonb_build_object('date', d::text, 'kind', 'predicted_period'));
      d := d + 1;
    end loop;
  end if;

  if (settings ->> 'fertile_window')::boolean and stats.n_cycles >= 2 and stats.spread <= 7 and stats.avg_length > 14 then
    fert_start := stats.last_start + stats.avg_length - 19;
    fert_end := stats.last_start + stats.avg_length - 12;
    d := greatest(fert_start, p_start);
    while d <= least(fert_end, p_end) loop
      marks := marks || jsonb_build_array(jsonb_build_object('date', d::text, 'kind', 'fertile'));
      d := d + 1;
    end loop;
  end if;

  return jsonb_build_object(
    'marks', marks,
    'prediction_status', case
      when stats.n_cycles < 2 then 'insufficient'
      when stats.spread > 7 then 'irregular'
      else 'regular'
    end
  );
end;
$$;

-- ---------- get_primary_partner_hub (for female user's partner tab) ----------
create or replace function public.get_primary_partner_hub()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  conn public.partner_connections;
  pending_invite record;
  partner_name text;
begin
  if uid is null then raise exception 'Not authenticated'; end if;

  select * into conn
  from public.partner_connections
  where primary_user_id = uid
  order by connected_at desc
  limit 1;

  if conn.id is not null and conn.status in ('active', 'paused') then
    select coalesce(full_name, 'Partner') into partner_name
    from public.profiles where id = conn.partner_user_id;
    return jsonb_build_object(
      'linked', true,
      'status', conn.status,
      'partner_name', partner_name,
      'connected_at', conn.connected_at,
      'sharing_settings', conn.sharing_settings
    );
  end if;

  select code, expires_at into pending_invite
  from public.partner_invites
  where primary_user_id = uid
    and redeemed_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  return jsonb_build_object(
    'linked', false,
    'pending_invite', case
      when pending_invite.code is not null then
        jsonb_build_object('code', pending_invite.code, 'expires_at', pending_invite.expires_at)
      else null
    end
  );
end;
$$;

-- ---------- cancel_partner_invite ----------
create or replace function public.cancel_partner_invite()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.partner_invites
  set redeemed_at = now()
  where primary_user_id = auth.uid()
    and redeemed_at is null;
end;
$$;

-- Grant execute to authenticated users
grant execute on function public.create_partner_invite() to authenticated;
grant execute on function public.cancel_partner_invite() to authenticated;
grant execute on function public.redeem_partner_code(text) to authenticated;
grant execute on function public.update_partner_sharing(jsonb) to authenticated;
grant execute on function public.pause_partner_sharing() to authenticated;
grant execute on function public.resume_partner_sharing() to authenticated;
grant execute on function public.revoke_partner_connection() to authenticated;
grant execute on function public.disconnect_as_partner() to authenticated;
grant execute on function public.get_partner_dashboard() to authenticated;
grant execute on function public.get_partner_calendar_range(date, date) to authenticated;
grant execute on function public.get_primary_partner_hub() to authenticated;
