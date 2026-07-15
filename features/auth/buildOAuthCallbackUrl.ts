import { getOAuthRedirectUri, urlHasOAuthParams } from '@/features/auth/oauthRedirect';

/** Reconstruct a callback URL from deep-link path segments or query params. */
export function buildOAuthCallbackUrl(
  url: string | null | undefined,
  params: Record<string, string | string[] | undefined>,
): string | null {
  if (url && urlHasOAuthParams(url)) return url;

  const pick = (key: string): string | undefined => {
    const value = params[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  const code = pick('code');
  const accessToken = pick('access_token');
  const refreshToken = pick('refresh_token');
  const error = pick('error');
  const errorDescription = pick('error_description');

  if (!code && !accessToken && !error) return url ?? null;

  const base = getOAuthRedirectUri().split('?')[0]?.split('#')[0] ?? getOAuthRedirectUri();
  const query = new URLSearchParams();
  if (code) query.set('code', code);
  if (accessToken) query.set('access_token', accessToken);
  if (refreshToken) query.set('refresh_token', refreshToken);
  if (error) query.set('error', error);
  if (errorDescription) query.set('error_description', errorDescription);

  const serialized = query.toString();
  return serialized ? `${base}?${serialized}` : base;
}
