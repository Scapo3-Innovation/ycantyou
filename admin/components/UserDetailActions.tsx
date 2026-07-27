'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type UserDetailProps = {
  userId: string;
  email: string | null;
  createdAt: string;
  profile: Record<string, unknown> | null;
};

export function UserDetailActions({ userId, email, createdAt, profile }: UserDetailProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function deleteUser() {
    if (!window.confirm(`Delete user ${email ?? userId}? This cannot be undone.`)) return;
    setLoading(true);
    setStatus(null);

    const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      setStatus(data.error ?? 'Delete failed');
      setLoading(false);
      return;
    }

    router.push('/users');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Link href="/users" className="text-sm text-rose-700 hover:underline">
        ← Back to users
      </Link>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">{email ?? 'User'}</h1>
        <p className="mt-1 font-mono text-xs text-zinc-500">{userId}</p>
        <p className="mt-3 text-sm text-zinc-600">Created {new Date(createdAt).toLocaleString()}</p>

        {profile ? (
          <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-50 p-4 text-xs">
            {JSON.stringify(profile, null, 2)}
          </pre>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">No profile row.</p>
        )}
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-900">Removes auth user and cascaded app data.</p>
        {status ? <p className="mt-2 text-sm text-red-700">{status}</p> : null}
        <button
          type="button"
          disabled={loading}
          onClick={() => void deleteUser()}
          className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-800 disabled:opacity-60">
          {loading ? 'Deleting…' : 'Delete user'}
        </button>
      </div>
    </div>
  );
}
