import { supabase } from '@/lib/supabase';
import type { ScreenerQuestion, ScreenerResult } from '@/types/database';

import type { AnswersByCode, ScoringResult } from './types';

/**
 * Screener data layer. Reads/writes go through RLS (owner-only on responses/results;
 * active questions are readable by any signed-in user). user_id always comes from the
 * caller; scoring itself happens server-side in the score-screener Edge Function.
 */

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

/** Persist all answers for one session (one row per question). */
export async function insertResponses(
  userId: string,
  sessionId: string,
  answers: AnswersByCode,
): Promise<void> {
  const rows = Object.entries(answers).map(([question_code, answer_bool]) => ({
    user_id: userId,
    session_id: sessionId,
    question_code,
    answer_bool,
  }));
  const { error } = await supabase.from('screener_responses').insert(rows);
  if (error) throw error;
}

/** Invoke server-side scoring for a session; returns the computed band. */
export async function invokeScoring(sessionId: string): Promise<ScoringResult> {
  const { data, error } = await supabase.functions.invoke('score-screener', {
    body: { session_id: sessionId },
  });
  if (error) throw error;
  return data as ScoringResult;
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
