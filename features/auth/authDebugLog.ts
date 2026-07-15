/** Safe OAuth debug logging — never logs tokens, emails, or refresh tokens. */

type OAuthLogMeta = Record<string, string | number | boolean | undefined>;

/** Re-enable when debugging OAuth redirect issues. */
export const OAUTH_DEBUG_ENABLED = false;

function isEnabled(): boolean {
  return OAUTH_DEBUG_ENABLED;
}

/** Strip secrets from a URL before logging. Keeps path + param key names only. */
export function sanitizeOAuthUrl(url: string | null | undefined): string {
  if (!url) return '(empty)';

  const hashIndex = url.indexOf('#');
  const beforeHash = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex + 1);
  const queryIndex = beforeHash.indexOf('?');
  const base = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : beforeHash.slice(queryIndex + 1);

  const keys: string[] = [];
  for (const part of [query, hash].filter(Boolean)) {
    for (const key of new URLSearchParams(part).keys()) {
      if (!keys.includes(key)) keys.push(key);
    }
  }

  return keys.length > 0 ? `${base} ?[${keys.join(', ')}]` : base;
}

export function logOAuthStep(step: string, meta?: OAuthLogMeta): void {
  if (!isEnabled()) return;
  if (meta && Object.keys(meta).length > 0) {
    console.log(`[auth:oauth] ${step}`, meta);
    return;
  }
  console.log(`[auth:oauth] ${step}`);
}

export function logOAuthStepError(step: string, error: unknown, meta?: OAuthLogMeta): void {
  if (!isEnabled()) return;
  const message = error instanceof Error ? error.message : String(error);
  console.log(`[auth:oauth] ${step} FAILED`, { ...meta, message });
}

export function describeOAuthParams(url: string): OAuthLogMeta {
  const hashIndex = url.indexOf('#');
  const beforeHash = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex + 1);
  const queryIndex = beforeHash.indexOf('?');
  const query = queryIndex === -1 ? '' : beforeHash.slice(queryIndex + 1);

  const keys: string[] = [];
  let error: string | undefined;
  let errorDescription: string | undefined;

  for (const part of [query, hash].filter(Boolean)) {
    const params = new URLSearchParams(part);
    for (const key of params.keys()) {
      if (!keys.includes(key)) keys.push(key);
    }
    error ??= params.get('error') ?? undefined;
    errorDescription ??= params.get('error_description') ?? undefined;
  }

  return {
    paramKeys: keys.join(', ') || '(none)',
    error,
    errorDescription,
    hasCode: keys.includes('code'),
    hasAccessToken: keys.includes('access_token'),
    hasRefreshToken: keys.includes('refresh_token'),
  };
}
