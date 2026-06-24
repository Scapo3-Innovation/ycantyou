import type { RiskBand } from '@/types/database';

/**
 * Display copy for the screener. Scoring/thresholds live ONLY in the Edge Function
 * (server-side, recalibratable). The client just renders the band the server returns.
 *
 * Language is deliberately about "likelihood of signs", never a diagnosis. Do not add
 * treatment advice or "you have PCOS" phrasing here.
 */

/** Non-diagnostic band labels. */
export const RISK_BAND_LABEL: Record<RiskBand, string> = {
  low: 'Lower likelihood',
  moderate: 'Moderate likelihood',
  high: 'Higher likelihood',
};

/** Short, descriptive (not prescriptive) blurb per band. */
export const RISK_BAND_BLURB: Record<RiskBand, string> = {
  low: 'Your answers suggest fewer PCOS-related signs. Keep tracking, and see a clinician if you have concerns.',
  moderate:
    'Your answers suggest some PCOS-related signs. This is not a diagnosis — a clinician can assess them properly.',
  high: 'Your answers suggest several PCOS-related signs. This is not a diagnosis — please see a clinician to discuss them.',
};

export const DISCLAIMER_SHORT = 'This is a screening tool, not a diagnosis.';

export const REFERRAL =
  'Please see a gynaecologist or endocrinologist to discuss your results.';

export const DISCLAIMER_LONG =
  'A questionnaire cannot diagnose PCOS. Your answers only indicate whether some commonly ' +
  'associated signs are present. ' +
  REFERRAL;

/** Plain-language Rotterdam-criteria explainer (education, not diagnosis). */
export const ROTTERDAM_INTRO =
  'PCOS is diagnosed by a doctor using the Rotterdam criteria — at least 2 of these three:';

export const ROTTERDAM_POINTS: readonly string[] = [
  'Irregular or absent ovulation (often irregular or missing periods).',
  'Signs of high androgens — excess hair growth, acne — or a blood test.',
  'Polycystic ovaries on ultrasound, or a high AMH blood level.',
];

export const ROTTERDAM_OUTRO = 'Only a clinician can assess these. This app cannot.';
