import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { AccountMode, Goal, SexAtBirth } from '@/types/database';

export type ProfileFieldPatch = {
  full_name?: string;
  dob?: string;
  sex_assigned_at_birth?: SexAtBirth;
  goal?: Goal | null;
  avatar_id?: string | null;
  avatar_url?: string | null;
  account_mode?: AccountMode;
  language?: string;
  onboarding_status?: 'pending' | 'completed';
};

function isMissingColumn(error: PostgrestError, column: string): boolean {
  return error.code === 'PGRST204' && error.message.includes(`'${column}'`);
}

/** Update the signed-in user's profile row, omitting sex if the column is not migrated yet. */
export async function saveProfileFields(
  userId: string,
  patch: ProfileFieldPatch,
): Promise<{ sexAtBirthSkipped: boolean }> {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select('id')
    .maybeSingle();

  if (!error) {
    if (!data) throw new Error('Profile row not found');
    return { sexAtBirthSkipped: false };
  }

  if (
    patch.sex_assigned_at_birth !== undefined &&
    isMissingColumn(error, 'sex_assigned_at_birth')
  ) {
    const { sex_assigned_at_birth: _ignored, ...withoutSex } = patch;
    const retry = await supabase
      .from('profiles')
      .update(withoutSex)
      .eq('id', userId)
      .select('id')
      .maybeSingle();

    if (retry.error) throw retry.error;
    if (!retry.data) throw new Error('Profile row not found');
    return { sexAtBirthSkipped: true };
  }

  if (patch.avatar_id !== undefined && isMissingColumn(error, 'avatar_id')) {
    const { avatar_id: _ignored, ...withoutAvatar } = patch;
    if (Object.keys(withoutAvatar).length === 0) {
      return { sexAtBirthSkipped: false };
    }
    const retry = await supabase
      .from('profiles')
      .update(withoutAvatar)
      .eq('id', userId)
      .select('id')
      .maybeSingle();

    if (retry.error) throw retry.error;
    if (!retry.data) throw new Error('Profile row not found');
    return { sexAtBirthSkipped: false };
  }

  if (patch.avatar_url !== undefined && isMissingColumn(error, 'avatar_url')) {
    throw new Error(
      'Could not save profile photo URL — apply database migration 0016 (npm run db:patch).',
    );
  }

  throw error;
}
