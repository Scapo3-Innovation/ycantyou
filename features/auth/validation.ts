import { z } from 'zod';

/** Email used to request an OTP. */
export const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});
export type EmailForm = z.infer<typeof emailSchema>;

/** The 6-digit code sent to the email. */
export const otpSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code'),
});
export type OtpForm = z.infer<typeof otpSchema>;
