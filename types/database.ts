/**
 * Hand-written types for the tables this module touches.
 * They mirror supabase/migrations/0001_initial_schema.sql. When the schema grows,
 * these can be replaced by `supabase gen types` output.
 */

export type Goal = 'cycle' | 'fertility' | 'symptoms' | 'weight' | 'mood';
export type OnboardingStatus = 'pending' | 'completed';

/** A row in public.profiles (1:1 with auth.users). */
export type Profile = {
  id: string;
  full_name: string | null;
  dob: string | null; // ISO date (YYYY-MM-DD)
  language: string;
  goal: Goal | null;
  onboarding_status: OnboardingStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

/** Fields the user can edit during onboarding / from the profile screen. */
export type ProfileUpdate = {
  full_name: string;
  dob: string;
  goal: Goal;
  language: string;
};

/** A row in public.consents (versioned, for DPDP). */
export type Consent = {
  id: string;
  user_id: string;
  consent_type: string;
  version: string;
  granted_at: string;
  revoked_at: string | null;
};

// ---------------------------------------------------------------------------
// Module 4 — cycle / period / symptom tracking
// ---------------------------------------------------------------------------

/** Period flow intensity for a daily log. */
export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

/** A row in public.cycles. start_date/end_date span the period (bleeding) days. */
export type Cycle = {
  id: string;
  user_id: string;
  start_date: string; // ISO date (YYYY-MM-DD)
  end_date: string | null; // ISO date; null while the period is ongoing
  is_predicted: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

/** A row in public.daily_logs (one per user per day). */
export type DailyLog = {
  id: string;
  user_id: string;
  log_date: string; // ISO date (YYYY-MM-DD)
  flow_level: FlowLevel | null;
  mood: number | null; // 1–5
  energy: number | null; // 1–5
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

/** A row in the public.symptoms lookup table. */
export type Symptom = {
  code: string;
  label: string;
  category: string | null;
};

/** A row in the public.daily_log_symptoms join table (no soft-delete column). */
export type DailyLogSymptom = {
  id: string;
  daily_log_id: string;
  symptom_code: string;
  severity: number | null; // 1–3
};

/** A daily log joined with its selected symptom codes — the editor's view model. */
export type DailyLogWithSymptoms = DailyLog & {
  symptom_codes: string[];
};

// ---------------------------------------------------------------------------
// Module 6 — PCOS risk screener
// ---------------------------------------------------------------------------

/** A row in public.screener_questions (config; weights drive server-side scoring). */
export type ScreenerQuestion = {
  id: string;
  code: string;
  text: string;
  category: string | null;
  weight: number;
  sort_order: number;
  active: boolean;
};

/** Risk band returned by the scoring Edge Function. */
export type RiskBand = 'low' | 'moderate' | 'high';

/** A row in public.screener_results (one per completed session). */
export type ScreenerResult = {
  id: string;
  user_id: string;
  session_id: string;
  score: number;
  risk_band: RiskBand;
  created_at: string;
};
