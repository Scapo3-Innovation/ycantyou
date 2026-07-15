import { isValid, parseISO } from 'date-fns';
import { z } from 'zod';

const GOAL_VALUES = ['cycle', 'fertility', 'symptoms', 'weight', 'mood'] as const;
const SEX_AT_BIRTH_VALUES = ['female', 'male', 'prefer_not_to_say'] as const;
const ONBOARDING_PATH_VALUES = ['primary', 'partner'] as const;

const dobField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  .refine((value) => isValid(parseISO(value)), 'Enter a real date')
  .refine((value) => parseISO(value) <= new Date(), 'Date of birth cannot be in the future');

/** Step 1 — name, sex assigned at birth, and date of birth. */
export const onboardingBasicsSchema = z.object({
  full_name: z.string().trim().min(1, 'Enter your name').max(120),
  sex_assigned_at_birth: z.enum(SEX_AT_BIRTH_VALUES, { message: 'Pick one' }),
  dob: dobField,
});

/** Step 2 — primary goal. */
export const onboardingGoalSchema = z.object({
  goal: z.enum(GOAL_VALUES, { message: 'Pick a goal' }),
});

/** Step 2 — partner invite code (6 chars). */
export const onboardingPartnerCodeSchema = z.object({
  partner_code: z
    .string()
    .trim()
    .length(6, 'Enter the 6-character code')
    .regex(/^[A-Z0-9]+$/, 'Code uses letters and numbers only'),
});

/** Step 2 — prefer_not_to_say users pick primary tracking or partner mode. */
export const onboardingPathSchema = z.object({
  onboarding_path: z.enum(ONBOARDING_PATH_VALUES, { message: 'Pick one' }),
});

/** Full onboarding + profile edit form. App content is English-only for now. */
export const profileDetailsSchema = onboardingBasicsSchema.merge(onboardingGoalSchema);

/** @deprecated Use profileDetailsSchema */
export const onboardingDetailsSchema = profileDetailsSchema;

export type OnboardingBasicsForm = z.infer<typeof onboardingBasicsSchema>;
export type OnboardingGoalForm = z.infer<typeof onboardingGoalSchema>;
export type ProfileDetailsForm = z.infer<typeof profileDetailsSchema>;
export type OnboardingDetailsForm = ProfileDetailsForm;
