import { z } from 'zod';

import { OTP_MAX_LENGTH, OTP_MIN_LENGTH } from '@/features/auth/otp';
import {
  isPasswordValid,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@/features/auth/passwordRules';

/** Email used to request an OTP. */
export const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});
export type EmailForm = z.infer<typeof emailSchema>;

/** Password for email + password sign-up. */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, 'Password is too long')
  .refine(isPasswordValid, 'Include letters and numbers (see checklist below)');

export const signUpSchema = emailSchema.extend({
  password: passwordSchema,
});
export type SignUpForm = z.infer<typeof signUpSchema>;

/** Email + password sign-in. */
export const signInSchema = emailSchema.extend({
  password: z.string().min(1, 'Enter your password'),
});
export type SignInForm = z.infer<typeof signInSchema>;

/** Code from the sign-in email. Length follows Supabase Auth config (6–10 digits). */
export const otpSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(
      new RegExp(`^\\d{${OTP_MIN_LENGTH},${OTP_MAX_LENGTH}}$`),
      'Enter the full code from your email',
    ),
});
export type OtpForm = z.infer<typeof otpSchema>;
