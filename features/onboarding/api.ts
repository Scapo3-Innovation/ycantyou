import { supabase } from '@/lib/supabase';
import type { ProfileUpdate } from '@/types/database';

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
export async function completeOnboarding(userId: string, details: ProfileUpdate): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...details, onboarding_status: 'completed' })
    .eq('id', userId);
  if (error) throw error;
}
