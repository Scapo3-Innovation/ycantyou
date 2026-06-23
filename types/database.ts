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
