import { createSupabaseServiceClient } from '@/lib/supabase/service';

type FeedbackRow = {
  id: string;
  user_id: string;
  kind: string;
  message: string;
  platform: string | null;
  created_at: string;
};

export default async function FeedbackPage() {
  const service = createSupabaseServiceClient();
  const { data } = await service
    .from('user_feedback')
    .select('id, user_id, kind, message, platform, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = (data ?? []) as FeedbackRow[];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Feedback & bugs</h1>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium uppercase">{row.kind}</span>
              <span>{new Date(row.created_at).toLocaleString()}</span>
              {row.platform ? <span>{row.platform}</span> : null}
              <span className="font-mono">{row.user_id.slice(0, 8)}…</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-800">{row.message}</p>
          </article>
        ))}
        {rows.length === 0 ? <p className="text-sm text-zinc-500">No feedback yet.</p> : null}
      </div>
    </div>
  );
}
