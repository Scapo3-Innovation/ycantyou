/** The four cycle phases insights are bucketed into. */
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

/** One row from get_cycle_length_stats (already coerced to numbers). */
export type CycleLengthStats = {
  n_cycles: number;
  avg_length: number | null;
  min_length: number | null;
  max_length: number | null;
  spread: number | null;
};

/** One row from get_symptom_phase_patterns. */
export type SymptomPhasePattern = {
  symptom_code: string;
  label: string;
  phase: CyclePhase;
  occurrences: number;
};

/** A surfaced symptom insight: which phase a symptom leans toward, and how strongly. */
export type SymptomInsight = {
  symptom_code: string;
  label: string;
  phase: CyclePhase;
  occurrences: number; // in the dominant phase
  total: number; // across all phases
};
