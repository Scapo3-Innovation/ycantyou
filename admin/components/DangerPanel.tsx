'use client';

import { useState } from 'react';

const CONFIRM = 'DELETE ALL TEST DATA';

type WipeAction = 'delete_all_users' | 'clear_feedback' | 'clear_community';

export function DangerPanel() {
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<WipeAction | null>(null);

  async function runAction(action: WipeAction) {
    setLoading(action);
    setStatus(null);

    const res = await fetch('/api/danger/wipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation, action }),
    });

    const data = (await res.json()) as { error?: string; ok?: boolean; deleted?: number };
    if (!res.ok) {
      setStatus(data.error ?? 'Request failed');
    } else {
      setStatus(action === 'delete_all_users' ? `Deleted ${data.deleted ?? 0} users.` : 'Done.');
      setConfirmation('');
    }
    setLoading(null);
  }

  return (
    <div className="space-y-6 rounded-xl border border-red-200 bg-red-50 p-6">
      <p className="text-sm text-red-900">
        Testing only. Requires <code className="rounded bg-white px-1">ADMIN_ALLOW_DESTRUCTIVE=true</code>.
        Type <strong>{CONFIRM}</strong> before running an action.
      </p>

      <input
        type="text"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        placeholder={CONFIRM}
        className="w-full max-w-md rounded-lg border border-red-300 px-3 py-2 text-sm"
      />

      {status ? <p className="text-sm text-zinc-800">{status}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void runAction('delete_all_users')}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-800 disabled:opacity-60">
          {loading === 'delete_all_users' ? 'Working…' : 'Delete all users (except you)'}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void runAction('clear_feedback')}
          className="rounded-lg border border-red-400 px-4 py-2 text-sm text-red-900 hover:bg-red-100 disabled:opacity-60">
          {loading === 'clear_feedback' ? 'Working…' : 'Clear all feedback'}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void runAction('clear_community')}
          className="rounded-lg border border-red-400 px-4 py-2 text-sm text-red-900 hover:bg-red-100 disabled:opacity-60">
          {loading === 'clear_community' ? 'Working…' : 'Clear community data'}
        </button>
      </div>
    </div>
  );
}
