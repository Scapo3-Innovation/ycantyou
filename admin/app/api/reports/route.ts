import { NextResponse } from 'next/server';

import { requireAdminUser } from '@/lib/requireAdmin';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export async function GET(request: Request) {
  const auth = await requireAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

  const url = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? '100')));

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from('community_reports')
    .select('id, reporter_id, post_id, comment_id, reason, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: 'Could not load reports' }, { status: 500 });
  }

  return NextResponse.json({ reports: data ?? [] });
}
