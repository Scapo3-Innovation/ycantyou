import { createClient } from '@supabase/supabase-js';

import { getServiceRoleKey, getSupabaseUrl } from '@/lib/env';

/** Service-role client — server-only route handlers; bypasses RLS. */
export function createSupabaseServiceClient() {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
