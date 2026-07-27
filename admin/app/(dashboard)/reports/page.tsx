import { createSupabaseServiceClient } from '@/lib/supabase/service';

type ReportRow = {
  id: string;
  reporter_id: string;
  post_id: string | null;
  comment_id: string | null;
  reason: string | null;
  status: string;
  created_at: string;
};

export default async function ReportsPage() {
  const service = createSupabaseServiceClient();
  const { data } = await service
    .from('community_reports')
    .select('id, reporter_id, post_id, comment_id, reason, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = (data ?? []) as ReportRow[];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Community reports</h1>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
              <span>{new Date(row.created_at).toLocaleString()}</span>
              <span className="font-medium text-zinc-700">{row.reason ?? '—'}</span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5">{row.status}</span>
            </div>
            <p className="mt-2 font-mono text-xs text-zinc-500">
              reporter {row.reporter_id.slice(0, 8)}…
              {row.post_id ? ` · post ${row.post_id.slice(0, 8)}…` : ''}
              {row.comment_id ? ` · comment ${row.comment_id.slice(0, 8)}…` : ''}
            </p>
          </article>
        ))}
        {rows.length === 0 ? <p className="text-sm text-zinc-500">No reports.</p> : null}
      </div>
    </div>
  );
}
