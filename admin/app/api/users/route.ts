import { NextResponse } from 'next/server';

import { requireAdminUser } from '@/lib/requireAdmin';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export async function GET(request: Request) {
  const auth = await requireAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('perPage') ?? '25')));

  const service = createSupabaseServiceClient();

  const { data: listData, error: listError } = await service.auth.admin.listUsers({
    page,
    perPage,
  });

  if (listError) {
    return NextResponse.json({ error: 'Could not list users' }, { status: 500 });
  }

  const ids = listData.users.map((u) => u.id);
  const { data: profiles } =
    ids.length > 0
      ? await service.from('profiles').select('id, full_name, onboarding_status, account_mode, created_at').in('id', ids)
      : { data: [] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const users = listData.users.map((u) => ({
    id: u.id,
    email: u.email ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    profile: profileById.get(u.id) ?? null,
  }));

  return NextResponse.json({
    users,
    page,
    perPage,
    total:
      listData && 'total' in listData && typeof listData.total === 'number'
        ? listData.total
        : users.length,
  });
}
