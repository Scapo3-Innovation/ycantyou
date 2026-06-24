import { supabase } from '@/lib/supabase';
import type { Profile, ProfileUpdate } from '@/types/database';

import { saveProfileFields } from './saveProfileFields';

/** Fetch the signed-in user's profile row. */
export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data as Profile;
}

/** Update editable profile fields. */
export async function updateProfile(
  userId: string,
  patch: Partial<ProfileUpdate>,
): Promise<Profile> {
  await saveProfileFields(userId, patch);
  return fetchProfile(userId);
}

/**
 * Request permanent account deletion.
 *
 * Deleting the auth user requires service-role privileges, which must NEVER live in the
 * client. This invokes a server-side Edge Function ('delete-account') that runs with the
 * service-role key and calls auth.admin.deleteUser; FK cascades remove the user's data.
 *
 * The function is stubbed and not yet deployed — this call will error until it is.
 */
export async function requestAccountDeletion(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', { body: {} });
  if (error) throw error;
}
