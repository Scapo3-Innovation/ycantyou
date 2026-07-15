-- ============================================================================
-- PCOS App — Screener scoring RPC (dev fallback when Edge Function not deployed)
-- Mirrors supabase/functions/score-screener/index.ts thresholds.
-- HUMAN REVIEW REQUIRED: health-data scoring logic
-- ============================================================================

-- One answer per question per session (retry-safe upserts)
create unique index if not exists idx_screener_responses_session_question
  on public.screener_responses (session_id, question_code);

create or replace function public.score_screener_session(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  score numeric := 0;
  band text;
  resp record;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_session_id is null then
    raise exception 'Invalid session_id';
  end if;

  if not exists (
    select 1 from public.screener_responses
    where session_id = p_session_id and user_id = uid
  ) then
    raise exception 'No responses for this session';
  end if;

  for resp in
    select r.answer_bool, q.weight
    from public.screener_responses r
    join public.screener_questions q
      on q.code = r.question_code and q.active = true
    where r.session_id = p_session_id
      and r.user_id = uid
  loop
    if resp.answer_bool is true then
      score := score + resp.weight;
    end if;
  end loop;

  band := case
    when score >= 11 then 'high'
    when score >= 6 then 'moderate'
    else 'low'
  end;

  insert into public.screener_results (user_id, session_id, score, risk_band)
  values (uid, p_session_id, score, band)
  on conflict (session_id) do update
    set score = excluded.score,
        risk_band = excluded.risk_band;

  return jsonb_build_object(
    'session_id', p_session_id,
    'score', score,
    'risk_band', band
  );
end;
$$;

grant execute on function public.score_screener_session(uuid) to authenticated;
