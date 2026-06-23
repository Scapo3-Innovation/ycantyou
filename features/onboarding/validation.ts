import { isValid, parseISO } from 'date-fns';
import { z } from 'zod';

const GOAL_VALUES = ['cycle', 'fertility', 'symptoms', 'weight', 'mood'] as const;

/** Onboarding details form: name, DOB, goal, language. */
export const onboardingDetailsSchema = z.object({
  full_name: z.string().trim().min(1, 'Enter your name').max(120),
  dob: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
    .refine((value) => isValid(parseISO(value)), 'Enter a real date')
    .refine((value) => parseISO(value) <= new Date(), 'Date of birth cannot be in the future'),
  goal: z.enum(GOAL_VALUES, { message: 'Pick a goal' }),
  language: z.string().min(2),
});

export type OnboardingDetailsForm = z.infer<typeof onboardingDetailsSchema>;
