import Link from 'next/link';

import { createSupabaseServiceClient } from '@/lib/supabase/service';

type UserRow = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  profile: {
    full_name: string | null;
    onboarding_status: string | null;
    account_mode: string | null;
  } | null;
};

async function loadUsers(): Promise<UserRow[]> {
  const service = createSupabaseServiceClient();
  const { data: listData, error } = await service.auth.admin.listUsers({ page: 1, perPage: 50 });
  if (error || !listData.users.length) return [];

  const ids = listData.users.map((u) => u.id);
  const { data: profiles } = await service
    .from('profiles')
    .select('id, full_name, onboarding_status, account_mode')
    .in('id', ids);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return listData.users.map((u) => ({
    id: u.id,
    email: u.email ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    profile: profileById.get(u.id) ?? null,
  }));
}

export default async function UsersPage() {
  const users = await loadUsers();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Onboarding</th>
              <th className="px-4 py-3 font-medium">Mode</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">{user.email ?? '—'}</td>
                <td className="px-4 py-3">{user.profile?.full_name ?? '—'}</td>
                <td className="px-4 py-3">{user.profile?.onboarding_status ?? '—'}</td>
                <td className="px-4 py-3">{user.profile?.account_mode ?? '—'}</td>
                <td className="px-4 py-3">
                  <Link href={`/users/${user.id}`} className="text-rose-700 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
