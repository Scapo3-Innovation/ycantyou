import { NextResponse } from 'next/server';

import { destructiveActionsAllowed } from '@/lib/env';
import { requireAdminUser } from '@/lib/requireAdmin';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await context.params;
  const service = createSupabaseServiceClient();

  const { data: authUser, error: authError } = await service.auth.admin.getUserById(id);
  if (authError || !authUser.user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { data: profile } = await service.from('profiles').select('*').eq('id', id).maybeSingle();

  return NextResponse.json({
    user: {
      id: authUser.user.id,
      email: authUser.user.email ?? null,
      created_at: authUser.user.created_at,
      last_sign_in_at: authUser.user.last_sign_in_at ?? null,
    },
    profile: profile ?? null,
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

  if (!destructiveActionsAllowed()) {
    return NextResponse.json({ error: 'Destructive actions disabled' }, { status: 403 });
  }

  const { id } = await context.params;
  if (id === auth.user!.id) {
    return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const { error } = await service.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }

  await service.from('admin_audit_log').insert({
    admin_user_id: auth.user!.id,
    action: 'delete_user',
    target_user_id: id,
    metadata: {},
  });

  return NextResponse.json({ ok: true });
}
