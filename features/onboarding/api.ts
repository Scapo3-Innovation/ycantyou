import { supabase } from '@/lib/supabase';
import type { Goal, ProfileUpdate, SexAtBirth } from '@/types/database';

import { DEFAULT_LANGUAGE } from '@/features/content/constants';
import { saveProfileFields } from '@/features/profile/saveProfileFields';
import { CONSENT_TYPE_HEALTH_DATA, CONSENT_VERSION } from './constants';

export type OnboardingBasics = {
  full_name: string;
  dob: string;
  sex_assigned_at_birth: SexAtBirth;
};

export type CompletePrimaryOnboardingInput = OnboardingBasics & {
  goal: Goal | null;
};

export type CompletePartnerOnboardingInput = OnboardingBasics & {
  partner_code: string;
};

/**
 * Record explicit DPDP consent for health-data processing.
 * One row per acceptance; granted_at defaults to now() in the DB (the real consent moment).
 */
export async function recordConsent(userId: string): Promise<void> {
  const { error } = await supabase.from('consents').insert({
    user_id: userId,
    consent_type: CONSENT_TYPE_HEALTH_DATA,
    version: CONSENT_VERSION,
  });
  if (error) throw error;
}

/**
 * Whether the user has already granted (and not revoked) the current consent version.
 * Used to skip the consent step when resuming an interrupted onboarding.
 */
export async function hasHealthDataConsent(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('consents')
    .select('id')
    .eq('user_id', userId)
    .eq('consent_type', CONSENT_TYPE_HEALTH_DATA)
    .eq('version', CONSENT_VERSION)
    .is('revoked_at', null)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

/**
 * Save the onboarding details and mark onboarding complete.
 * This UPDATEs the profile row auto-created by the handle_new_user DB trigger.
 */
export type CompleteOnboardingResult = {
  /** True when the DB is missing migration 0006 — run supabase/apply-pending.sql. */
  sexAtBirthSkipped: boolean;
};

export async function completeOnboarding(
  userId: string,
  details: ProfileUpdate,
): Promise<CompleteOnboardingResult> {
  return saveProfileFields(userId, {
    ...details,
    account_mode: 'primary',
    language: DEFAULT_LANGUAGE,
    onboarding_status: 'completed',
  });
}

/** Primary user path — basics + goal. */
export async function completePrimaryOnboarding(
  userId: string,
  details: CompletePrimaryOnboardingInput,
): Promise<CompleteOnboardingResult> {
  return completeOnboarding(userId, details);
}

/** Partner user path — redeem code then mark onboarding complete. */
export async function completePartnerOnboarding(
  userId: string,
  details: CompletePartnerOnboardingInput,
): Promise<CompleteOnboardingResult> {
  const { redeemPartnerCode } = await import('@/features/partner/api');

  const basicsResult = await saveProfileFields(userId, {
    full_name: details.full_name,
    dob: details.dob,
    sex_assigned_at_birth: details.sex_assigned_at_birth,
    language: DEFAULT_LANGUAGE,
    onboarding_status: 'pending',
  });

  await redeemPartnerCode(details.partner_code);

  await saveProfileFields(userId, {
    goal: null,
    account_mode: 'partner',
    onboarding_status: 'completed',
  });

  return basicsResult;
}
