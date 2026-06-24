import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * score-screener — server-side PCOS screener scoring.
 *
 * Reads the caller's responses + active question weights, computes a weighted score,
 * maps it to a risk band, and writes ONE row to screener_results.
 *
 * Security:
 *  - Uses the ANON key + the caller's JWT (Authorization header), so EVERY query runs
 *    under Row-Level Security. Reading the session's responses under RLS is what proves
 *    the caller owns the session — a user cannot read another user's rows.
 *  - The service-role key is never used here.
 *  - No response/score/PII is ever logged (health data).
 *
 * Deploy:  supabase functions deploy score-screener   (keep JWT verification ON — default)
 * Env:     SUPABASE_URL / SUPABASE_ANON_KEY are injected by the platform automatically.
 */

// ── Risk thresholds — SINGLE SOURCE OF TRUTH. Recalibrate here. ──────────────
// score = sum of weights of "yes" answers (max ≈ 22 with the current seed).
// This is a screening heuristic, NOT a validated clinical instrument.
const RISK_THRESHOLDS = { moderateMin: 6, highMin: 11 } as const;

type Band = "low" | "moderate" | "high";
const bandFor = (score: number): Band =>
  score >= RISK_THRESHOLDS.highMin
    ? "high"
    : score >= RISK_THRESHOLDS.moderateMin
      ? "moderate"
      : "low";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);

    // Anon key + the caller's JWT → RLS applies to EVERY query below. No service role.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => null);
    const sessionId = body?.session_id;
    if (!sessionId || !UUID_RE.test(sessionId)) return json({ error: "Invalid session_id" }, 400);

    // RLS scopes this to the caller — so it also proves they own the session.
    const { data: responses, error: respErr } = await supabase
      .from("screener_responses")
      .select("question_code, answer_bool")
      .eq("session_id", sessionId);
    if (respErr) return json({ error: "Could not read responses" }, 400);
    if (!responses?.length) return json({ error: "No responses for this session" }, 404);

    const { data: questions, error: qErr } = await supabase
      .from("screener_questions")
      .select("code, weight")
      .eq("active", true);
    if (qErr || !questions) return json({ error: "Could not read questions" }, 400);

    const weightByCode = new Map<string, number>(
      questions.map((q) => [q.code as string, Number(q.weight)]),
    );
    let score = 0;
    for (const r of responses) {
      if (r.answer_bool === true) score += weightByCode.get(r.question_code as string) ?? 0;
    }
    const risk_band = bandFor(score);

    const { error: upErr } = await supabase
      .from("screener_results")
      .upsert(
        { user_id: user.id, session_id: sessionId, score, risk_band },
        { onConflict: "session_id" },
      );
    if (upErr) return json({ error: "Could not save result" }, 400);

    // Never log responses/score tied to a user (health data).
    return json({ session_id: sessionId, score, risk_band }, 200);
  } catch {
    return json({ error: "Unexpected error" }, 500);
  }
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
