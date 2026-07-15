import type { RiskBand, ScreenerQuestion } from '@/types/database';

import type { AnswersByCode } from './types';

/** Matches supabase/functions/score-screener and migration 0010 thresholds. */
export const SCORER_THRESHOLDS = { moderateMin: 6, highMin: 11 } as const;

export function riskBandForScore(score: number): RiskBand {
  if (score >= SCORER_THRESHOLDS.highMin) return 'high';
  if (score >= SCORER_THRESHOLDS.moderateMin) return 'moderate';
  return 'low';
}

/** Weighted yes-count → score + band (screening heuristic, not a diagnosis). */
export function computeScore(
  answers: AnswersByCode,
  questions: Pick<ScreenerQuestion, 'code' | 'weight'>[],
): { score: number; risk_band: RiskBand } {
  const weights = new Map(questions.map((q) => [q.code, Number(q.weight)]));
  let score = 0;
  for (const [code, yes] of Object.entries(answers)) {
    if (yes) score += weights.get(code) ?? 0;
  }
  return { score, risk_band: riskBandForScore(score) };
}
