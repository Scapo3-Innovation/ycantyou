'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/', label: 'Overview' },
  { href: '/users', label: 'Users' },
  { href: '/feedback', label: 'Feedback' },
  { href: '/reports', label: 'Reports' },
  { href: '/danger', label: 'Danger zone' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold text-zinc-900">ycantyou Admin</span>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => {
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1 text-sm ${
                    active ? 'bg-rose-100 text-rose-800' : 'text-zinc-600 hover:bg-zinc-100'
                  }`}>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">
          Sign out
        </button>
      </div>
    </header>
  );
}
