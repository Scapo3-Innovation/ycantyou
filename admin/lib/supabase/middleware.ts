import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { getAdminEmailAllowlist, getSupabaseAnonKey, getSupabaseUrl, isAdminEmail } from '@/lib/env';

const PUBLIC_PATHS = ['/login', '/api/auth/signout'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((entry) => path === entry || path.startsWith(`${entry}/`));

  if (isPublic) {
    if (user && isAdminEmail(user.email) && path.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!isAdminEmail(user.email)) {
    await supabase.auth.signOut();
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'not_admin');
    if (getAdminEmailAllowlist().length === 0) {
      loginUrl.searchParams.set('error', 'no_allowlist');
    }
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
