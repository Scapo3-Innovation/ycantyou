import { redirect } from 'next/navigation';

import { AdminNav } from '@/components/AdminNav';
import { requireAdminUser } from '@/lib/requireAdmin';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdminUser();
  if (auth.error) redirect('/login');

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
