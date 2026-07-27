import { format } from 'date-fns';
import { z } from 'zod';

import {
  FUTURE_DATE_MESSAGE,
  isFutureDate,
  isPeriodTooLong,
  ongoingBleedingDays,
  PAST_PERIOD_NEEDS_END_MESSAGE,
  PERIOD_TOO_LONG_MESSAGE,
  MAX_PERIOD_BLEEDING_DAYS,
} from './periodBounds';

/** YYYY-MM-DD calendar date. */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date');

const todayIso = () => format(new Date(), 'yyyy-MM-dd');

/**
 * Log/edit a period. end_date is optional (ongoing period) but, when present, must not
 * fall before start_date. Bleeding length is capped at a realistic maximum.
 */
export const periodSchema = z
  .object({
    start_date: isoDate,
    end_date: isoDate.nullable().optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((v) => !v.end_date || v.end_date >= v.start_date, {
    message: 'End date cannot be before the start date',
    path: ['end_date'],
  })
  .refine((v) => !isFutureDate(v.start_date, todayIso()), {
    message: FUTURE_DATE_MESSAGE,
    path: ['start_date'],
  })
  .refine((v) => !v.end_date || !isFutureDate(v.end_date, todayIso()), {
    message: FUTURE_DATE_MESSAGE,
    path: ['end_date'],
  })
  .superRefine((v, ctx) => {
    const today = todayIso();
    if (v.end_date) {
      if (isPeriodTooLong(v.start_date, v.end_date, today)) {
        ctx.addIssue({
          code: 'custom',
          message: PERIOD_TOO_LONG_MESSAGE,
          path: ['end_date'],
        });
      }
      return;
    }
    if (ongoingBleedingDays(v.start_date, today) > MAX_PERIOD_BLEEDING_DAYS) {
      ctx.addIssue({
        code: 'custom',
        message: PAST_PERIOD_NEEDS_END_MESSAGE,
        path: ['end_date'],
      });
    }
  });
export type PeriodForm = z.infer<typeof periodSchema>;

const flowLevel = z.enum(['none', 'spotting', 'light', 'medium', 'heavy']);
const scale = z.number().int().min(1).max(5);

/** A daily log: every field optional, but at least one must be set to be worth saving. */
export const dailyLogSchema = z
  .object({
    flow_level: flowLevel.nullable().optional(),
    mood: scale.nullable().optional(),
    energy: scale.nullable().optional(),
    notes: z.string().trim().max(1000).optional(),
    symptom_codes: z.array(z.string()).default([]),
  })
  .refine(
    (v) =>
      Boolean(v.flow_level) ||
      v.mood != null ||
      v.energy != null ||
      Boolean(v.notes) ||
      v.symptom_codes.length > 0,
    { message: 'Add at least one detail before saving' },
  );
export type DailyLogForm = z.infer<typeof dailyLogSchema>;
