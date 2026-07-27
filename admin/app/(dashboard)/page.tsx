import Link from 'next/link';

import { createSupabaseServiceClient } from '@/lib/supabase/service';

async function loadStats() {
  const service = createSupabaseServiceClient();
  const [usersRes, feedbackRes, reportsRes] = await Promise.all([
    service.auth.admin.listUsers({ page: 1, perPage: 1 }),
    service.from('user_feedback').select('id', { count: 'exact', head: true }),
    service.from('community_reports').select('id', { count: 'exact', head: true }),
  ]);

  const usersTotal =
    usersRes.data && 'total' in usersRes.data && typeof usersRes.data.total === 'number'
      ? usersRes.data.total
      : usersRes.data?.users?.length ?? 0;

  return {
    users: usersTotal,
    feedback: feedbackRes.count ?? 0,
    reports: reportsRes.count ?? 0,
  };
}

export default async function DashboardPage() {
  const stats = await loadStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-zinc-600">Testing-stage admin — service role stays on the server.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Auth users" value={stats.users} href="/users" />
        <StatCard label="Feedback rows" value={stats.feedback} href="/feedback" />
        <StatCard label="Community reports" value={stats.reports} href="/reports" />
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-rose-200">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </Link>
  );
}
