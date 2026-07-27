import { Suspense } from 'react';

import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Suspense fallback={<p className="text-sm text-zinc-600">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
