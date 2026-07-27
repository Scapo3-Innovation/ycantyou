import { NextResponse } from 'next/server';

import { requireAdminUser } from '@/lib/requireAdmin';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

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

  return NextResponse.json({
    users: usersTotal,
    feedback: feedbackRes.count ?? 0,
    reports: reportsRes.count ?? 0,
  });
}
