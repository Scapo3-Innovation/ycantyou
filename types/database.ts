/**
 * Hand-written types for the tables this module touches.
 * They mirror supabase/migrations/0001_initial_schema.sql. When the schema grows,
 * these can be replaced by `supabase gen types` output.
 */

export type Goal = 'cycle' | 'fertility' | 'symptoms' | 'weight' | 'mood';
export type SexAtBirth = 'female' | 'male' | 'prefer_not_to_say';
export type OnboardingStatus = 'pending' | 'completed';
export type AccountMode = 'primary' | 'partner';

/** A row in public.profiles (1:1 with auth.users). */
export type Profile = {
  id: string;
  full_name: string | null;
  dob: string | null; // ISO date (YYYY-MM-DD)
  sex_assigned_at_birth: SexAtBirth | null;
  language: string;
  goal: Goal | null;
  avatar_id: string | null;
  avatar_url: string | null;
  account_mode?: AccountMode;
  onboarding_status: OnboardingStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

/** Fields the user can edit during onboarding / from the profile screen. */
export type ProfileUpdate = {
  full_name: string;
  dob: string;
  sex_assigned_at_birth: SexAtBirth;
  goal: Goal | null;
  avatar_id?: string | null;
  avatar_url?: string | null;
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
  is_anonymous: boolean;
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
  is_anonymous: boolean;
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

/** A row in public.community_dislikes. */
export type CommunityDislike = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

/** A row in public.community_comment_likes. */
export type CommunityCommentLike = {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
};

/** Per-user community reputation stats. */
export type CommunityProfile = {
  user_id: string;
  helpful_likes_received: number;
  comment_count: number;
  is_trusted_contributor: boolean;
  trusted_at: string | null;
  updated_at: string;
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

// ---------------------------------------------------------------------------
// Partner session — consent-first sharing
// ---------------------------------------------------------------------------

export type PartnerConnectionStatus = 'active' | 'paused' | 'revoked';

/** Granular toggles the primary user controls. */
export type PartnerSharingSettings = {
  cycle_phase: boolean;
  period_dates: boolean;
  predictions: boolean;
  fertile_window: boolean;
  mood_energy_summary: boolean;
  symptoms_summary: boolean;
  daily_notes: boolean;
  screener_summary: boolean;
};

export type PartnerInvite = {
  code: string;
  expires_at: string;
};

export type PartnerCycleState =
  | { kind: 'period'; day: number }
  | { kind: 'cycle'; day: number; phase: string };

export type PartnerDashboardPrediction =
  | { status: 'insufficient' }
  | { status: 'irregular'; avg_length: number; spread: number; basis: number }
  | {
      status: 'regular';
      avg_length: number;
      basis: number;
      last_start: string;
      next_period: { predicted_start: string; window_start: string; window_end: string } | null;
      fertile: { ovulation: string; start: string; end: string } | null;
    };

export type PartnerDashboard =
  | { status: 'none' }
  | { status: 'paused'; primary_name: string }
  | {
      status: 'active';
      primary_name: string;
      partner_name: string;
      connected_at: string;
      sharing_settings: PartnerSharingSettings;
      today: string;
      cycle_state: PartnerCycleState | null;
      prediction: PartnerDashboardPrediction | null;
      wellness_today: { mood: string | null; energy: string | null } | null;
      symptoms_today: string[] | null;
      screener_band: RiskBand | null;
    };

export type PartnerCalendarMarkKind = 'period' | 'predicted_period' | 'fertile';

export type PartnerCalendarMark = {
  date: string;
  kind: PartnerCalendarMarkKind;
};

export type PartnerCalendarRange = {
  marks: PartnerCalendarMark[];
  prediction_status: 'none' | 'insufficient' | 'irregular' | 'regular';
};

export type PrimaryPartnerHub =
  | {
      linked: true;
      status: PartnerConnectionStatus;
      partner_name: string;
      connected_at: string;
      sharing_settings: PartnerSharingSettings;
    }
  | {
      linked: false;
      pending_invite: PartnerInvite | null;
    };

// ---------------------------------------------------------------------------
// User feedback (Settings → bug report / product feedback)
// ---------------------------------------------------------------------------

export type FeedbackKind = 'bug' | 'feature' | 'feedback';

export type UserFeedback = {
  id: string;
  user_id: string;
  kind: FeedbackKind;
  message: string;
  app_version: string | null;
  platform: 'ios' | 'android' | 'web' | null;
  device_model: string | null;
  created_at: string;
};
