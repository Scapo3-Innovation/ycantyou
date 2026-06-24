import type { RiskBand } from '@/types/database';

/** Map of question code → yes(true)/no(false) answer collected during the flow. */
export type AnswersByCode = Record<string, boolean>;

/** Shape returned by the score-screener Edge Function. */
export type ScoringResult = {
  session_id: string;
  score: number;
  risk_band: RiskBand;
};
