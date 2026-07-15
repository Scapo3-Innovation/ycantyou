import { getSupabaseHost } from '@/lib/supabase';
import { isUnreachableHostError, unreachableSupabaseMessage } from '@/lib/supabaseErrors';

const SIGNUP_SERVER_ERROR =
  'Supabase could not finish sign-up (server error). Check Logs → Auth. If you see "BadCredentials" or "535", fix SMTP under Project Settings → Authentication → SMTP (Gmail needs an App Password).';

function authErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  if ('status' in error && typeof error.status === 'number') return error.status;
  return undefined;
}

function authErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return '';
  if ('message' in error && typeof error.message === 'string') return error.message;
  return '';
}

function authErrorCode(error: unknown): string {
  if (!error || typeof error !== 'object') return '';
  if ('code' in error && typeof error.code === 'string') return error.code;
  return '';
}

function isServerError(error: unknown, message: string): boolean {
  const status = authErrorStatus(error);
  if (status === 500 || status === 502 || status === 503) return true;
  if (message.includes('"status":500') || message.includes('status":500')) return true;
  if (message.includes('/auth/v1/signup')) return true;
  return false;
}

/** User-safe message for sign-up failures. */
export function mapSignUpError(error: unknown): string {
  if (isUnreachableHostError(error)) {
    return unreachableSupabaseMessage(getSupabaseHost());
  }

  const message = authErrorMessage(error);
  const code = authErrorCode(error);
  const combined = `${code} ${message}`.toLowerCase();

  if (isServerError(error, message)) {
    return SIGNUP_SERVER_ERROR;
  }

  if (
    /already registered|already exists|user already|user_already_exists|email_exists/.test(
      combined,
    )
  ) {
    return 'This email already has an account. Sign in instead.';
  }
  if (/signups not allowed|signup.?disabled|signup_disabled/.test(combined)) {
    return 'Sign-ups are turned off in Supabase. Enable Email under Authentication → Providers.';
  }
  if (/rate limit|too many|over_email_send/.test(combined)) {
    return 'Too many attempts. Wait a few minutes, then try again.';
  }
  if (/sending confirmation|confirm.*email|email.*send|smtp|mail|badcredentials|5\.7\.8|username and password not accepted|535/.test(combined)) {
    return 'Could not send the verification email. Fix Supabase SMTP: Project Settings → Authentication → SMTP. If using Gmail, use an App Password (not your normal password), or turn off custom SMTP to use Supabase email for testing.';
  }
  if (/password|weak_password/.test(combined)) {
    return 'Password not accepted. Use at least 8 characters with letters and numbers.';
  }
  if (/invalid.*email|validation/.test(combined)) {
    return 'Enter a valid email address.';
  }

  if (__DEV__ && message && !message.startsWith('{')) return message;

  return 'Could not create your account. Check your connection and try again.';
}

/** User-safe message for sign-in failures. */
export function mapSignInError(error: unknown): string {
  if (isUnreachableHostError(error)) {
    return unreachableSupabaseMessage(getSupabaseHost());
  }

  const message = authErrorMessage(error);
  const combined = `${authErrorCode(error)} ${message}`.toLowerCase();

  if (/invalid login|invalid credentials|user not found/.test(combined)) {
    return 'Incorrect email or password. Try again or reset your password.';
  }
  if (/email not confirmed|not confirmed/.test(combined)) {
    return 'Confirm your email first. Check your inbox for the verification code.';
  }

  if (__DEV__ && message && !message.startsWith('{')) return message;

  return 'Could not sign in. Check your connection and try again.';
}
