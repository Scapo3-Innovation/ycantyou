import {
  signInWithGoogleOAuth,
  type GoogleSignInResult,
} from '@/features/auth/googleOAuth';
import {
  clearPendingSignUpPassword,
  setPendingSignUpPassword,
  signUpUsesEmailOtp,
  takePendingSignUpPassword,
} from '@/features/auth/pendingSignUp';
import { clearWelcomeSeen } from '@/features/onboarding/welcomeStorage';
import { supabase } from '@/lib/supabase';

/** Email OTP / recovery flow — sign-up confirmation or password reset. */
export type EmailAuthMode = 'sign-up' | 'recovery';

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

/** Sign in with email and password. */
export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/**
 * Send a recovery code to reset a forgotten password.
 * Supabase email template should use `{{ .Token }}` for a typed code.
 */
export async function sendPasswordRecoveryOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

function isAuthServerError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const status = 'status' in error && typeof error.status === 'number' ? error.status : 0;
  const message = 'message' in error && typeof error.message === 'string' ? error.message : '';
  return status >= 500 || message.includes('"status":500') || message.includes('/auth/v1/signup');
}

/**
 * Start sign-up with email + password.
 * Tries signUp first (Confirm signup email). On server 500, falls back to signInWithOtp (Magic Link email).
 */
export async function startSignUpWithPassword(email: string, password: string): Promise<void> {
  clearPendingSignUpPassword();
  const normalized = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: normalized,
    password,
  });

  if (error) {
    if (isAuthServerError(error)) {
      setPendingSignUpPassword(password);
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: { shouldCreateUser: true },
      });
      if (otpError) {
        clearPendingSignUpPassword();
        throw otpError;
      }
      return;
    }
    throw error;
  }

  if (!data.user) {
    throw new Error(
      'Sign-up did not complete. This email may already be registered — try Sign in instead.',
    );
  }
}

/** Verify sign-up OTP — supports Confirm signup or Magic Link OTP fallback. */
export async function completeSignUpVerification(email: string, token: string): Promise<void> {
  const pendingPassword = takePendingSignUpPassword();

  if (pendingPassword) {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: 'email',
    });
    if (error) throw error;

    const { error: passwordError } = await supabase.auth.updateUser({ password: pendingPassword });
    if (passwordError) throw passwordError;
    return;
  }

  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token,
    type: 'signup',
  });
  if (error) throw error;
}

/**
 * @deprecated Use startSignUpWithPassword — kept as alias for compatibility.
 */
export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<'verify' | 'signed-in'> {
  await startSignUpWithPassword(email, password);
  return 'verify';
}

/** Verify the 6-digit email OTP. On success, supabase-js persists the session and emits an auth event. */
export async function verifyEmailOtp(
  email: string,
  token: string,
  mode: EmailAuthMode = 'sign-up',
): Promise<void> {
  if (mode === 'sign-up') {
    await completeSignUpVerification(email, token);
    return;
  }
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
  if (error) throw error;
}

/** Set a new password after recovery OTP verification. */
export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/** Resend a sign-up confirmation or password-recovery code. */
export async function resendEmailOtp(email: string, mode: EmailAuthMode): Promise<void> {
  if (mode === 'recovery') {
    await sendPasswordRecoveryOtp(email);
    return;
  }
  if (mode === 'sign-up') {
    if (signUpUsesEmailOtp()) {
      await sendEmailOtp(email, 'sign-up');
      return;
    }
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
    return;
  }
  await sendEmailOtp(email, 'sign-up');
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
  clearPendingSignUpPassword();
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
