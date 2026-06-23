// ============================================================================
// delete-account — Supabase Edge Function (STUB — NOT DEPLOYED)
// ============================================================================
// PURPOSE
//   Permanently delete the calling user's auth account. Because every user-owned
//   table references public.profiles(id) -> auth.users(id) ON DELETE CASCADE,
//   removing the auth user cascades away all of their data (DPDP right to erase).
//
// WHY SERVER-SIDE
//   Deleting an auth user requires the SERVICE-ROLE key (admin). That key must
//   NEVER ship in the app. This function runs server-side with the service-role
//   key provided as a function secret — it is the only safe place to do this.
//
// SECURITY — FLAGGED FOR HUMAN REVIEW BEFORE DEPLOY
//   * Authenticate the caller from their JWT (Authorization header) and delete
//     ONLY that user — never trust a user id from the request body.
//   * Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as function secrets
//     (supabase secrets set ...). Do not hardcode.
//   * Consider a soft-delete / grace period before hard deletion.
//
// DEPLOY (later, not in this module):
//   supabase functions deploy delete-account
//
// This file is intentionally excluded from the app tsconfig/eslint (Deno runtime).
// The types below are declared loosely so it does not need the Deno toolchain to read.
// ============================================================================

// @ts-nocheck
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Function not configured' }), { status: 500 });
    }

    // Identify the caller from their JWT — never from the request body.
    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
    }

    // Admin client deletes the caller; FK cascade removes their data.
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { error: deleteError } = await admin.auth.admin.deleteUser(userData.user.id);
    if (deleteError) {
      return new Response(JSON.stringify({ error: 'Delete failed' }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Unexpected error' }), { status: 500 });
  }
});
