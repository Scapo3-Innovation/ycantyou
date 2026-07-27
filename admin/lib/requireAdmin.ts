import { isAdminEmail } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isAdminEmail(user.email)) {
    return { error: 'Unauthorized' as const, user: null };
  }

  return { error: null, user };
}
