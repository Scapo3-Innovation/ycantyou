/**
 * Holds sign-up state between create-account and OTP verify screens.
 * Cleared after use or on sign-out. Never logged or persisted.
 */
let pendingPassword: string | null = null;
/** True when sign-up used signInWithOtp fallback (verify with type `email`). */
let useEmailOtpVerify = false;

export function setPendingSignUpPassword(password: string): void {
  pendingPassword = password;
  useEmailOtpVerify = true;
}

export function takePendingSignUpPassword(): string | null {
  const value = pendingPassword;
  pendingPassword = null;
  useEmailOtpVerify = false;
  return value;
}

export function clearPendingSignUpPassword(): void {
  pendingPassword = null;
  useEmailOtpVerify = false;
}

export function signUpUsesEmailOtp(): boolean {
  return useEmailOtpVerify;
}
