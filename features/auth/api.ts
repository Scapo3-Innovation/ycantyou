import {
  signInWithGoogleOAuth,
  type GoogleSignInResult,
} from '@/features/auth/googleOAuth';
import { clearWelcomeSeen } from '@/features/onboarding/welcomeStorage';
import { supabase } from '@/lib/supabase';

/** Email OTP flow — sign in to an existing account or create a new one. */
export type EmailAuthMode = 'sign-in' | 'sign-up';

/**
 * Auth API — the single place that talks to Supabase Auth.
 *
 * Email OTP and Google OAuth are wired up. Phone OTP is still a stub.
 *
 * NOTE: never log the email, token, or session here — they are sensitive.
 */

/**
 * Send a 6-digit OTP to the given email.
 *
 * We intentionally pass NO `emailRedirectTo`, and the Supabase email template should use
 * `{{ .Token }}` — so the user receives a typed code, not a clickable magic link.
 * OTP length is set in Supabase Dashboard → Authentication → Providers → Email → OTP length (use 6).
 * (`detectSessionInUrl: false` in lib/supabase.ts means a link would not be handled anyway.)
 */
export async function sendEmailOtp(email: string, mode: EmailAuthMode = 'sign-up'): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: mode === 'sign-up' },
  });
  if (error) throw error;
}

/**
 * Create an account with email and password.
 * If email confirmation is enabled in Supabase, returns `verify` so the user can enter the OTP.
 */
export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<'verify' | 'signed-in'> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.session ? 'signed-in' : 'verify';
}

/** Verify the 6-digit email OTP. On success, supabase-js persists the session and emits an auth event. */
export async function verifyEmailOtp(
  email: string,
  token: string,
  mode: EmailAuthMode = 'sign-in',
): Promise<void> {
  const type = mode === 'sign-up' ? 'signup' : 'email';
  const { error } = await supabase.auth.verifyOtp({ email, token, type });
  if (error) throw error;
}

/** Resend a sign-in OTP or sign-up confirmation code. */
export async function resendEmailOtp(email: string, mode: EmailAuthMode): Promise<void> {
  if (mode === 'sign-up') {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
    return;
  }
  await sendEmailOtp(email, 'sign-in');
}

/**
 * DEV/testing only — sign in as an anonymous guest.
 *
 * Creates a real authenticated `auth.users` row (the `handle_new_user` DB trigger then
 * creates the matching `profiles` row), so the guest goes through onboarding + consent and
 * lands in the tabs exactly like any signed-in user, with RLS scoping them to their own rows.
 * Uses the anon key only. Requires "Anonymous sign-ins" to be enabled in the Supabase
 * dashboard. Surfaced behind a DEV flag in the UI — hide before launch.
 */
export async function signInAsGuest(): Promise<void> {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    if (/anonymous|signups not allowed/i.test(error.message)) {
      throw new Error(
        'Guest sign-in is disabled in Supabase. Enable Anonymous sign-ins under Authentication → Providers.',
      );
    }
    throw error;
  }

  if (data.session) return;

  // Avoid auth lock deadlock — wait for onAuthStateChange to finish before getSession.
  await new Promise((resolve) => setTimeout(resolve, 0));
  const { data: refreshed, error: refreshError } = await supabase.auth.getSession();
  if (refreshError) throw refreshError;
  if (!refreshed.session) {
    throw new Error('Guest sign-in did not create a session. Try again.');
  }
}

/**
 * Start upgrading an anonymous guest into a permanent account by linking an email.
 * Sends a 6-digit confirmation code to the address (Supabase reuses the same OTP template).
 * Completed by `verifyEmailUpgrade`. The user id is preserved, so all existing profile,
 * consent, and logged data carry over.
 */
export async function startEmailUpgrade(email: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ email });
  if (error) throw error;
}

/** Verify the 6-digit code that confirms the linked email, completing the guest upgrade. */
export async function verifyEmailUpgrade(email: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email_change' });
  if (error) throw error;
}

/** Sign the current user out. Root navigator sends you back to the welcome intro. */
export async function signOut(): Promise<void> {
  await clearWelcomeSeen();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Stubs for later auth methods — DO NOT use yet (Module 3.x).
// Kept here so screens/context have a stable surface to plug into.
// ---------------------------------------------------------------------------

/** TODO(phone-otp): swap to supabase.auth.signInWithOtp({ phone }). */
export async function sendPhoneOtp(_phone: string): Promise<never> {
  throw new Error('Phone OTP is not implemented yet.');
}

/** Sign in with Google via Supabase OAuth (system browser). */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  return signInWithGoogleOAuth();
}
