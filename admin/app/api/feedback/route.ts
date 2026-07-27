import { NextResponse } from 'next/server';

import { requireAdminUser } from '@/lib/requireAdmin';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export async function GET(request: Request) {
  const auth = await requireAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

  const url = new URL(request.url);
  const kind = url.searchParams.get('kind');
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? '100')));

  const service = createSupabaseServiceClient();
  let query = service
    .from('user_feedback')
    .select('id, user_id, kind, message, app_version, platform, device_model, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (kind && ['bug', 'feature', 'feedback'].includes(kind)) {
    query = query.eq('kind', kind);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Could not load feedback' }, { status: 500 });
  }

  return NextResponse.json({ feedback: data ?? [] });
}
