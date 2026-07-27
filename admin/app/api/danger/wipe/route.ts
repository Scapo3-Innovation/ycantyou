import { NextResponse } from 'next/server';

import { destructiveActionsAllowed } from '@/lib/env';
import { requireAdminUser } from '@/lib/requireAdmin';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

const CONFIRM_FULL = 'DELETE ALL TEST DATA';

type WipeBody = {
  confirmation?: string;
  action?: 'delete_all_users' | 'clear_feedback' | 'clear_community';
};

export async function POST(request: Request) {
  const auth = await requireAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

  if (!destructiveActionsAllowed()) {
    return NextResponse.json({ error: 'Set ADMIN_ALLOW_DESTRUCTIVE=true to enable wipes' }, { status: 403 });
  }

  let body: WipeBody;
  try {
    body = (await request.json()) as WipeBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.confirmation !== CONFIRM_FULL) {
    return NextResponse.json({ error: `Type exactly: ${CONFIRM_FULL}` }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const adminId = auth.user!.id;

  if (body.action === 'clear_feedback') {
    const { error } = await service.from('user_feedback').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) return NextResponse.json({ error: 'Clear feedback failed' }, { status: 500 });
    await logAudit(service, adminId, 'clear_feedback', null);
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'clear_community') {
    const tables = [
      'community_likes',
      'community_dislikes',
      'community_reports',
      'community_comments',
      'community_posts',
      'community_blocks',
    ] as const;

    for (const table of tables) {
      const { error } = await service.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        return NextResponse.json({ error: `Clear ${table} failed` }, { status: 500 });
      }
    }

    await logAudit(service, adminId, 'clear_community', null);
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'delete_all_users') {
    let page = 1;
    let deleted = 0;

    while (true) {
      const { data, error } = await service.auth.admin.listUsers({ page, perPage: 100 });
      if (error) return NextResponse.json({ error: 'List users failed' }, { status: 500 });

      for (const u of data.users) {
        if (u.id === adminId) continue;
        const { error: delErr } = await service.auth.admin.deleteUser(u.id);
        if (!delErr) deleted += 1;
      }

      if (data.users.length < 100) break;
      page += 1;
    }

    await logAudit(service, adminId, 'delete_all_users', null, { deleted });
    return NextResponse.json({ ok: true, deleted });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

async function logAudit(
  service: ReturnType<typeof createSupabaseServiceClient>,
  adminUserId: string,
  action: string,
  targetUserId: string | null,
  metadata: Record<string, unknown> = {},
) {
  await service.from('admin_audit_log').insert({
    admin_user_id: adminUserId,
    action,
    target_user_id: targetUserId,
    metadata,
  });
}
