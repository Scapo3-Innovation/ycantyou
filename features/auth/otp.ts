/** Supabase email OTP length is configured server-side (default 6, some projects use 8). */
export const OTP_MIN_LENGTH = 6;
export const OTP_MAX_LENGTH = 10;

export function normalizeOtpInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, OTP_MAX_LENGTH);
}
