import { z } from 'zod';

import { OTP_MAX_LENGTH, OTP_MIN_LENGTH } from '@/features/auth/otp';

/** Email used to request an OTP. */
export const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});
export type EmailForm = z.infer<typeof emailSchema>;

/** Password for email + password sign-up (Supabase Auth minimum). */
export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Password is too long');

export const signUpSchema = emailSchema.extend({
  password: passwordSchema,
});
export type SignUpForm = z.infer<typeof signUpSchema>;

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
