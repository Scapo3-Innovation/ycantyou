import { supabase } from '@/lib/supabase';

import type { CycleLengthStats, SymptomPhasePattern } from './types';

/**
 * Insights data layer — calls the server-side aggregation RPCs. Both functions run under
 * the caller's RLS (SECURITY INVOKER), so they only ever see the signed-in user's rows.
 */

const EMPTY_STATS: CycleLengthStats = {
  n_cycles: 0,
  avg_length: null,
  min_length: null,
  max_length: null,
  spread: null,
};

/** Postgres `numeric` comes back from PostgREST as a string — coerce to a number or null. */
function num(value: number | string | null): number | null {
  if (value === null) return null;
  const n = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(n) ? n : null;
}

/** Cycle-length stats over recent cycles (one row, or an all-zero fallback). */
export async function fetchCycleLengthStats(): Promise<CycleLengthStats> {
  const { data, error } = await supabase.rpc('get_cycle_length_stats');
  if (error) throw error;
  const row = (data as CycleLengthStats[] | null)?.[0];
  if (!row) return EMPTY_STATS;
  return {
    n_cycles: num(row.n_cycles) ?? 0,
    avg_length: num(row.avg_length),
    min_length: num(row.min_length),
    max_length: num(row.max_length),
    spread: num(row.spread),
  };
}

/** Symptom-by-phase occurrence counts (the client decides what to surface). */
export async function fetchSymptomPhasePatterns(): Promise<SymptomPhasePattern[]> {
  const { data, error } = await supabase.rpc('get_symptom_phase_patterns');
  if (error) throw error;
  return (data as SymptomPhasePattern[] | null) ?? [];
}
