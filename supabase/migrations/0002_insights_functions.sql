-- ============================================================================
-- PCOS App — Module 5: Insights aggregation functions (server-side, RLS-safe)
-- Run in the Supabase SQL Editor (or via the migration tooling).
-- ============================================================================
-- WHY SERVER-SIDE: trends should not be computed by fetching every row to the
-- client. These functions aggregate in Postgres and return small result sets.
--
-- SECURITY: SECURITY INVOKER → each query runs as the calling user, so the
-- tables' RLS policies scope rows to auth.uid(). We also filter
-- user_id = auth.uid() explicitly for clarity and to use the user/date indexes.
-- search_path = '' + fully-qualified names prevents search_path hijacking.
-- ============================================================================

-- 1) Cycle-length stats over the most recent `window_size` completed cycles.
--    Returns ONE row: how many cycle lengths were measured, their average, min,
--    max, and spread (max - min). The client uses `spread` to label the cycles
--    regular vs. irregular, and `n_cycles` to decide if there's enough data.
create or replace function public.get_cycle_length_stats(window_size int default 6)
returns table (n_cycles int, avg_length numeric, min_length int, max_length int, spread int)
language sql
stable
security invoker
set search_path = ''
as $$
  with starts as (
    select start_date,
           lead(start_date) over (order by start_date) as next_start
    from public.cycles
    where user_id = auth.uid()
      and deleted_at is null
      and is_predicted = false
  ),
  lengths as (
    select (next_start - start_date) as len, start_date
    from starts
    where next_start is not null
      and (next_start - start_date) > 0
    order by start_date desc
    limit window_size
  )
  select count(*)::int,
         round(avg(len), 1),
         min(len)::int,
         max(len)::int,
         (max(len) - min(len))::int
  from lengths;
$$;

-- 2) Symptom frequency by cycle phase, over COMPLETED cycles only (a cycle is
--    "completed" once a later period start exists, so its length — and thus its
--    ovulation/luteal boundaries — are known). Each logged symptom occurrence is
--    bucketed into menstrual / follicular / ovulation / luteal using THAT cycle's
--    own length, so irregular cycles are handled per-cycle rather than assumed.
--    Returns one row per (symptom, phase) with an occurrence count; the client
--    decides which leans are strong enough to surface as an insight.
create or replace function public.get_symptom_phase_patterns(
  min_len int default 21,
  max_len int default 45
)
returns table (symptom_code text, label text, phase text, occurrences int)
language sql
stable
security invoker
set search_path = ''
as $$
  with spans as (
    select start_date,
           lead(start_date) over (order by start_date) as next_start
    from public.cycles
    where user_id = auth.uid() and deleted_at is null and is_predicted = false
  ),
  completed as (
    select start_date, next_start, (next_start - start_date) as cycle_len
    from spans
    where next_start is not null
      and (next_start - start_date) between min_len and max_len
  ),
  logs_in_phase as (
    select dls.symptom_code,
           case
             when (dl.log_date - c.start_date) < 5
               then 'menstrual'
             when (dl.log_date - c.start_date) between (c.cycle_len - 15) and (c.cycle_len - 13)
               then 'ovulation'
             when (dl.log_date - c.start_date) > (c.cycle_len - 13)
               then 'luteal'
             else 'follicular'
           end as phase
    from public.daily_logs dl
    join completed c
      on dl.log_date >= c.start_date and dl.log_date < c.next_start
    join public.daily_log_symptoms dls on dls.daily_log_id = dl.id
    where dl.user_id = auth.uid() and dl.deleted_at is null
  )
  select lp.symptom_code, s.label, lp.phase, count(*)::int as occurrences
  from logs_in_phase lp
  join public.symptoms s on s.code = lp.symptom_code
  group by lp.symptom_code, s.label, lp.phase
  order by lp.symptom_code, occurrences desc;
$$;

-- Only signed-in users may call these (they still only see their own data via RLS).
grant execute on function public.get_cycle_length_stats(int) to authenticated;
grant execute on function public.get_symptom_phase_patterns(int, int) to authenticated;

-- ============================================================================
-- END
-- ============================================================================
