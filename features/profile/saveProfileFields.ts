import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Goal, SexAtBirth } from '@/types/database';

export type ProfileFieldPatch = {
  full_name?: string;
  dob?: string;
  sex_assigned_at_birth?: SexAtBirth;
  goal?: Goal;
  language?: string;
  onboarding_status?: 'pending' | 'completed';
};

function isMissingSexAtBirthColumn(error: PostgrestError): boolean {
  return (
    error.code === 'PGRST204' &&
    error.message.includes("'sex_assigned_at_birth'")
  );
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
    isMissingSexAtBirthColumn(error)
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

  throw error;
}
