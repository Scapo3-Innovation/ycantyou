import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';

import type { Cycle } from '@/types/database';

import {
  FERTILE_WINDOW_AFTER_DAYS,
  FERTILE_WINDOW_BEFORE_DAYS,
  IRREGULAR_SPREAD_DAYS,
  LUTEAL_PHASE_DAYS,
  PERIOD_WINDOW_RADIUS,
  PREDICTION_WINDOW,
} from './constants';

/** A clearly-labeled estimate of the next period (and, when regular, the fertile window). */
export type CyclePrediction =
  | { status: 'insufficient' }
  | {
      status: 'irregular';
      avgLength: number;
      spread: number;
      basis: number; // number of cycle lengths the estimate is based on
      lastStart: string;
    }
  | {
      status: 'regular';
      avgLength: number;
      basis: number;
      lastStart: string;
      predictedStart: string; // YYYY-MM-DD
      windowStart: string;
      windowEnd: string;
      /** Estimated fertile window — only for regular cycles, never a contraception signal. */
      fertile: { start: string; end: string; ovulation: string } | null;
    };

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

/**
 * Estimate the next period from the average of recent cycle lengths.
 *
 * Honest by design (PCOS calendar prediction is only ~18% accurate):
 *  - fewer than 2 recorded period starts → "insufficient" (we don't guess from nothing).
 *  - if recent cycle lengths spread by more than IRREGULAR_SPREAD_DAYS → "irregular":
 *    we show the average but refuse to commit to a date or a fertile window.
 *  - otherwise → "regular": a date ± a small window, plus a disclaimed fertile estimate.
 */
export function computeCyclePrediction(cycles: Cycle[]): CyclePrediction {
  // Use only real (non-predicted) period starts, oldest → newest.
  const starts = cycles
    .filter((c) => !c.is_predicted)
    .map((c) => c.start_date)
    .sort();

  if (starts.length < 2) return { status: 'insufficient' };

  // Cycle length = days between consecutive period starts; keep the most recent few.
  const lengths: number[] = [];
  for (let i = 1; i < starts.length; i += 1) {
    const prev = starts[i - 1];
    const curr = starts[i];
    if (!prev || !curr) continue;
    lengths.push(differenceInCalendarDays(parseISO(curr), parseISO(prev)));
  }
  const recent = lengths.slice(-PREDICTION_WINDOW).filter((n) => n > 0);
  if (recent.length === 0) return { status: 'insufficient' };

  const lastStart = starts[starts.length - 1];
  if (!lastStart) return { status: 'insufficient' };

  const avgLength = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
  const spread = Math.max(...recent) - Math.min(...recent);
  const basis = recent.length;

  if (spread > IRREGULAR_SPREAD_DAYS) {
    return { status: 'irregular', avgLength, spread, basis, lastStart };
  }

  const predicted = addDays(parseISO(lastStart), avgLength);

  // Fertile window only makes sense for a regular cycle long enough to place ovulation.
  let fertile: { start: string; end: string; ovulation: string } | null = null;
  if (avgLength > LUTEAL_PHASE_DAYS) {
    const ovulation = addDays(predicted, -LUTEAL_PHASE_DAYS);
    fertile = {
      ovulation: iso(ovulation),
      start: iso(addDays(ovulation, -FERTILE_WINDOW_BEFORE_DAYS)),
      end: iso(addDays(ovulation, FERTILE_WINDOW_AFTER_DAYS)),
    };
  }

  return {
    status: 'regular',
    avgLength,
    basis,
    lastStart,
    predictedStart: iso(predicted),
    windowStart: iso(addDays(predicted, -PERIOD_WINDOW_RADIUS)),
    windowEnd: iso(addDays(predicted, PERIOD_WINDOW_RADIUS)),
    fertile,
  };
}
