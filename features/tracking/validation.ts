import { z } from 'zod';

/** YYYY-MM-DD calendar date. */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date');

/**
 * Log/edit a period. end_date is optional (ongoing period) but, when present, must not
 * fall before start_date.
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
