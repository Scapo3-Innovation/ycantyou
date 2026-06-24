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

// ---------------------------------------------------------------------------
// Module 7 — education / content hub
// ---------------------------------------------------------------------------

/** A row in public.content_categories. */
export type ContentCategory = {
  id: string;
  slug: string;
  name: string;
  language: string;
  sort_order: number;
};

/** A row in public.content_articles. */
export type ContentArticle = {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  language: string;
  category_id: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/** A row in public.content_bookmarks (owner-only saved article). */
export type ContentBookmark = {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Module 8 — community
// ---------------------------------------------------------------------------

/** A row in public.community_posts. */
export type CommunityPost = {
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

/** A row in public.community_comments. */
export type CommunityComment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  deleted_at: string | null;
};

/** A row in public.community_likes. */
export type CommunityLike = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

/** A row in public.community_blocks (owner-only). */
export type CommunityBlock = {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
};

/** Report status lifecycle (moderation queue). */
export type ReportStatus = 'open' | 'reviewed' | 'actioned' | 'dismissed';

/** A row in public.community_reports. */
export type CommunityReport = {
  id: string;
  reporter_id: string;
  post_id: string | null;
  comment_id: string | null;
  reason: string | null;
  status: ReportStatus;
  created_at: string;
};
