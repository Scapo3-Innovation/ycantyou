import { clearWelcomeSeen } from '@/features/onboarding/welcomeStorage';
import { supabase } from '@/lib/supabase';

/**
 * Auth API — the single place that talks to Supabase Auth.
 *
 * Email 6-digit OTP is the only method wired up right now. Phone OTP and Google
 * OAuth are intentionally left as throwing stubs so the rest of the app (screens,
 * session context) is already structured to accept them without rework.
 *
 * NOTE: never log the email, token, or session here — they are sensitive.
 */

/**
 * Send a 6-digit OTP to the given email.
 *
 * We intentionally pass NO `emailRedirectTo`, and the Supabase email template is set to
 * send `{{ .Token }}` — so the user receives a typed 6-digit code, not a clickable magic
 * link. (`detectSessionInUrl: false` in lib/supabase.ts means a link would not be handled
 * anyway.) The code is verified by `verifyEmailOtp` below.
 */
export async function sendEmailOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

/** Verify the 6-digit email OTP. On success, supabase-js persists the session and emits an auth event. */
export async function verifyEmailOtp(email: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
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
  const { error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
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

/** TODO(google): wire expo-auth-session + supabase.auth.signInWithIdToken / signInWithOAuth. */
export async function signInWithGoogle(): Promise<never> {
  throw new Error('Google sign-in is not implemented yet.');
}
