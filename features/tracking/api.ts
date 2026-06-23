import { supabase } from '@/lib/supabase';
import type {
  Cycle,
  DailyLog,
  DailyLogWithSymptoms,
  Symptom,
} from '@/types/database';

import type { DailyLogForm, PeriodForm } from './validation';

/**
 * Tracking data layer — the only place that talks to Supabase for cycles / daily logs.
 *
 * Security: every read filters `.is('deleted_at', null)` (soft-delete), and `user_id` is
 * always supplied by the caller from the active session — never hardcoded. RLS
 * (user_id = auth.uid()) is the real enforcement; these filters are for correctness.
 */

// --- Cycles -----------------------------------------------------------------

/** All of a user's non-deleted cycles, most recent first. */
export async function fetchCycles(userId: string): Promise<Cycle[]> {
  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Cycle[];
}

/** Log a new period. */
export async function insertCycle(userId: string, form: PeriodForm): Promise<Cycle> {
  const { data, error } = await supabase
    .from('cycles')
    .insert({
      user_id: userId,
      start_date: form.start_date,
      end_date: form.end_date ?? null,
      notes: form.notes ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as Cycle;
}

/** Edit an existing period. */
export async function updateCycle(id: string, form: PeriodForm): Promise<Cycle> {
  const { data, error } = await supabase
    .from('cycles')
    .update({
      start_date: form.start_date,
      end_date: form.end_date ?? null,
      notes: form.notes ?? null,
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Cycle;
}

/** Soft-delete a period (sets deleted_at; reads filter it out). */
export async function softDeleteCycle(id: string): Promise<void> {
  const { error } = await supabase
    .from('cycles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// --- Symptoms (lookup) ------------------------------------------------------

/** The static symptom lookup, ordered for stable display. */
export async function fetchSymptoms(): Promise<Symptom[]> {
  const { data, error } = await supabase
    .from('symptoms')
    .select('*')
    .order('category', { ascending: true })
    .order('label', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Symptom[];
}

// --- Daily logs -------------------------------------------------------------

/** Recent non-deleted daily logs (for calendar marking), newest first. */
export async function fetchRecentDailyLogs(userId: string, sinceDate: string): Promise<DailyLog[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('log_date', sinceDate)
    .order('log_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DailyLog[];
}

/** The daily log for one date (with its selected symptom codes), or null if none. */
export async function fetchDailyLog(
  userId: string,
  date: string,
): Promise<DailyLogWithSymptoms | null> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*, daily_log_symptoms(symptom_code)')
    .eq('user_id', userId)
    .eq('log_date', date)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { daily_log_symptoms, ...log } = data as DailyLog & {
    daily_log_symptoms: { symptom_code: string }[];
  };
  return { ...log, symptom_codes: daily_log_symptoms.map((s) => s.symptom_code) };
}

/**
 * Create or update the daily log for a date, then reconcile its symptom join rows.
 *
 * Enforces one log per day via the (user_id, log_date) unique constraint (upsert). If a
 * soft-deleted log exists for the date, it is revived (deleted_at → null). Symptoms are
 * reconciled by replacing the log's join rows with the current selection.
 */
export async function upsertDailyLog(
  userId: string,
  date: string,
  form: DailyLogForm,
): Promise<DailyLogWithSymptoms> {
  const { data: log, error: logError } = await supabase
    .from('daily_logs')
    .upsert(
      {
        user_id: userId,
        log_date: date,
        flow_level: form.flow_level ?? null,
        mood: form.mood ?? null,
        energy: form.energy ?? null,
        notes: form.notes ?? null,
        deleted_at: null,
      },
      { onConflict: 'user_id,log_date' },
    )
    .select('*')
    .single();
  if (logError) throw logError;

  const logId = (log as DailyLog).id;

  // Replace the join rows with the current selection (the join table has no soft-delete).
  const { error: delError } = await supabase
    .from('daily_log_symptoms')
    .delete()
    .eq('daily_log_id', logId);
  if (delError) throw delError;

  if (form.symptom_codes.length > 0) {
    const { error: insError } = await supabase.from('daily_log_symptoms').insert(
      form.symptom_codes.map((code) => ({ daily_log_id: logId, symptom_code: code })),
    );
    if (insError) throw insError;
  }

  return { ...(log as DailyLog), symptom_codes: form.symptom_codes };
}

/** Soft-delete a daily log (its symptom join rows are filtered out via the parent). */
export async function softDeleteDailyLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('daily_logs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
