import { supabase } from '@/lib/supabase';
import type { ProfileUpdate } from '@/types/database';

import { DEFAULT_LANGUAGE } from '@/features/content/constants';
import { saveProfileFields } from '@/features/profile/saveProfileFields';
import { CONSENT_TYPE_HEALTH_DATA, CONSENT_VERSION } from './constants';

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
    language: DEFAULT_LANGUAGE,
    onboarding_status: 'completed',
  });
}
