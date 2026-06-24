import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * delete-account — permanently delete the CALLING user's account (DPDP right to erase).
 *
 * Every user-owned table references public.profiles(id) → auth.users(id) ON DELETE CASCADE,
 * so deleting the auth user cascades away all of their data.
 *
 * SECURITY (the ONLY place a service-role key is used):
 *  - The caller is identified from their JWT via an ANON client — never from the request body.
 *  - A separate SERVICE-ROLE client performs admin.deleteUser(user.id) for THAT user only.
 *  - No personal data is logged.
 *
 * Deploy:  supabase functions deploy delete-account   (keep JWT verification ON — default)
 * Env:     SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are injected
 *          automatically by the platform — nothing to set.
 */

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Identify the caller from their JWT ONLY (anon client + their bearer token).
    const caller = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await caller.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    // Admin client deletes exactly that user; FK cascade removes all of their rows.
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) return json({ error: "Delete failed" }, 500);

    return json({ ok: true }, 200); // no personal data logged
  } catch {
    return json({ error: "Unexpected error" }, 500);
  }
});
