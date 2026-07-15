import { supabase } from '@/lib/supabase';
import { isSchemaNotReadyError } from '@/lib/supabaseErrors';
import type { ScreenerQuestion, ScreenerResult } from '@/types/database';

import { computeScore } from './scoring';
import type { AnswersByCode, ScoringResult } from './types';

/**
 * Screener data layer. Reads/writes go through RLS (owner-only on responses/results;
 * active questions are readable by any signed-in user). Scoring runs server-side via
 * the score-screener Edge Function or Postgres RPC; dev falls back to client compute + upsert.
 */

function isScoringResult(data: unknown): data is ScoringResult {
  if (!data || typeof data !== 'object') return false;
  const row = data as Record<string, unknown>;
  return (
    typeof row.session_id === 'string' &&
    typeof row.risk_band === 'string' &&
    typeof row.score === 'number'
  );
}

function isMissingScoringRpc(error: unknown): boolean {
  if (isSchemaNotReadyError(error)) return true;
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = String((error as { message: string }).message);
    return msg.includes('score_screener_session') || msg.includes('Could not find the function');
  }
  return false;
}

function scoringErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = String((error as { message: string }).message);
    return msg.replace(/^.*?:\s*/, '');
  }
  return 'Could not score your answers. Please try again.';
}

/** Dev fallback when Edge Function / RPC are not deployed — writes result under RLS. */
async function scoreSessionClientSide(sessionId: string): Promise<ScoringResult> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (authError || !userId) throw new Error('You must be signed in to complete the screener.');

  const [{ data: responses, error: respError }, questions] = await Promise.all([
    supabase
      .from('screener_responses')
      .select('question_code, answer_bool')
      .eq('session_id', sessionId)
      .eq('user_id', userId),
    fetchActiveQuestions(),
  ]);

  if (respError) throw respError;
  if (!responses?.length) throw new Error('No responses found for this session.');

  const answers: AnswersByCode = Object.fromEntries(
    responses.map((r) => [r.question_code, r.answer_bool ?? false]),
  );

  const { score, risk_band } = computeScore(answers, questions);

  const { error: upsertError } = await supabase.from('screener_results').upsert(
    { user_id: userId, session_id: sessionId, score, risk_band },
    { onConflict: 'session_id' },
  );
  if (upsertError) throw upsertError;

  return { session_id: sessionId, score, risk_band };
}

/** Active screener questions in display order. */
export async function fetchActiveQuestions(): Promise<ScreenerQuestion[]> {
  const { data, error } = await supabase
    .from('screener_questions')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ScreenerQuestion[];
}

/** Persist all answers for one session (replace prior rows — retry-safe). */
export async function insertResponses(
  userId: string,
  sessionId: string,
  answers: AnswersByCode,
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('screener_responses')
    .delete()
    .eq('user_id', userId)
    .eq('session_id', sessionId);
  if (deleteError) throw deleteError;

  const rows = Object.entries(answers).map(([question_code, answer_bool]) => ({
    user_id: userId,
    session_id: sessionId,
    question_code,
    answer_bool,
  }));

  const { error: insertError } = await supabase.from('screener_responses').insert(rows);
  if (insertError) throw insertError;
}

/** Score a session server-side (Edge Function → Postgres RPC → dev client fallback). */
export async function invokeScoring(sessionId: string): Promise<ScoringResult> {
  const { data: fnData, error: fnError } = await supabase.functions.invoke('score-screener', {
    body: { session_id: sessionId },
  });

  if (!fnError && isScoringResult(fnData)) {
    return fnData;
  }

  const { data, error } = await supabase.rpc('score_screener_session', {
    p_session_id: sessionId,
  });

  if (!error && isScoringResult(data)) {
    return data;
  }

  if (error && !isMissingScoringRpc(error)) {
    throw new Error(scoringErrorMessage(error));
  }

  try {
    return await scoreSessionClientSide(sessionId);
  } catch (fallbackError) {
    throw new Error(scoringErrorMessage(fallbackError));
  }
}

/** The result row for a session (null if scoring hasn't completed). */
export async function fetchResult(sessionId: string): Promise<ScreenerResult | null> {
  const { data, error } = await supabase
    .from('screener_results')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();
  if (error) throw error;
  return (data as ScreenerResult | null) ?? null;
}

/** Past screener results, newest first. */
export async function fetchHistory(userId: string): Promise<ScreenerResult[]> {
  const { data, error } = await supabase
    .from('screener_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ScreenerResult[];
}
