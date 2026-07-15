import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Linking from 'expo-linking';

import { logOAuthStep, OAUTH_DEBUG_ENABLED } from '@/features/auth/authDebugLog';

const OAUTH_CALLBACK_PATH = 'auth/callback';

/** OAuth params in query or hash — not a normal app navigation link. */
export function urlHasOAuthParams(url: string): boolean {
  return /(?:^|[?&#])(code|access_token|error)=/.test(url);
}

export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

/** True when using exp:// + LAN IP (Supabase hosted often rejects this). */
export function isLanExpoRedirect(uri: string): boolean {
  return /^exp:\/\/\d+\.\d+\.\d+\.\d+/i.test(uri);
}

function buildHttpsCallback(base: string): string {
  const trimmed = base.replace(/\/$/, '');
  const withPath = trimmed.includes(OAUTH_CALLBACK_PATH)
    ? trimmed
    : `${trimmed}/--/${OAUTH_CALLBACK_PATH}`;
  return withPath.replace(/([^:]\/)\/+/g, '$1');
}

/**
 * Redirect URI registered with Supabase Auth for native OAuth callbacks.
 *
 * Expo Go + tunnel (recommended): https://….exp.direct/--/auth/callback
 * Expo Go + LAN (unreliable):     exp://HOST:8081/--/auth/callback
 * Dev/prod build:                 pcos://auth/callback
 */
export function getOAuthRedirectUri(): string {
  const override = process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URI?.trim();
  if (override) return override.replace(/\/$/, '');

  const hostUri = Constants.expoConfig?.hostUri ?? '';
  const linkingUri = Constants.linkingUri ?? '';

  // Expo tunnel — Supabase accepts HTTPS redirects reliably.
  if (hostUri.includes('exp.direct') || linkingUri.startsWith('https://')) {
    const httpsBase = linkingUri.startsWith('https://')
      ? linkingUri.split('?')[0]?.split('#')[0] ?? linkingUri
      : `https://${hostUri}`;
    return buildHttpsCallback(httpsBase);
  }

  // Expo Go on LAN — use expo-router deep link path.
  if (hostUri && isExpoGo()) {
    return `exp://${hostUri}/--/${OAUTH_CALLBACK_PATH}`;
  }

  // Prefer Linking helper when available (dev builds).
  const created = Linking.createURL(OAUTH_CALLBACK_PATH).replace(/\/$/, '');
  if (created && !created.startsWith('exp://localhost')) {
    return created;
  }

  return `pcos://${OAUTH_CALLBACK_PATH}`;
}

/** Site URL to set in Supabase when using Expo Go (fallback if redirect fails). */
export function getRecommendedSupabaseSiteUrl(): string {
  const redirect = getOAuthRedirectUri();
  if (redirect.startsWith('https://')) {
    return redirect.split('/--/')[0] ?? redirect;
  }
  if (redirect.startsWith('exp://')) {
    return redirect.split('/--/')[0] ?? redirect;
  }
  return 'http://localhost:3000';
}

/** Expo Go on LAN without tunnel override — Google OAuth usually fails on Supabase hosted. */
export function requiresTunnelForExpoGo(): boolean {
  if (!__DEV__ || !isExpoGo()) return false;
  if (process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URI?.trim()) return false;
  return isLanExpoRedirect(getOAuthRedirectUri());
}

/** All redirect URL variants to register in Supabase. */
export function getSupabaseRedirectUrlVariants(): string[] {
  const primary = getOAuthRedirectUri();
  const base = primary.split('?')[0]?.split('#')[0] ?? primary;
  const hostMatch = base.match(/^exp:\/\/([^/]+)/);
  const host = hostMatch?.[1];

  const variants = new Set<string>([primary, `${base}/**`, 'pcos://auth/callback']);

  if (host) {
    variants.add(`exp://${host}`);
    variants.add(`exp://${host}/**`);
    variants.add(`exp://${host}/--/${OAUTH_CALLBACK_PATH}`);
  }

  if (base.startsWith('https://')) {
    variants.add(`${base.split('/--/')[0]}/**`);
  }

  return [...variants];
}

export function logOAuthRedirectUriDebug(): void {
  const uri = getOAuthRedirectUri();
  logOAuthStep('redirectUri.resolved', {
    redirectTo: uri,
    hostUri: Constants.expoConfig?.hostUri,
    linkingUri: Constants.linkingUri,
    isExpoGo: isExpoGo(),
    requiresTunnel: requiresTunnelForExpoGo(),
  });
  if (__DEV__ && OAUTH_DEBUG_ENABLED) {
    logOAuthRedirectSetup(uri);
  }
}

export function logOAuthRedirectSetup(uri: string): void {
  const projectRef =
    process.env.EXPO_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ??
    'YOUR_PROJECT_REF';

  console.log('[auth] ── Supabase OAuth setup (mobile app) ──');
  console.log('[auth] 1. Redirect URLs — add PRIMARY (exact), then Save:');
  console.log('[auth]   ', uri);
  for (const url of getSupabaseRedirectUrlVariants()) {
    if (url !== uri) console.log('[auth]   ', url);
  }
  console.log('[auth] 2. Site URL — set to (NOT localhost on a phone):');
  console.log('[auth]   ', getRecommendedSupabaseSiteUrl());
  console.log('[auth] 3. Google Cloud redirect (NOT exp://):');
  console.log('[auth]   ', `https://${projectRef}.supabase.co/auth/v1/callback`);
  console.log('[auth] 4. OAuth Server (BETA) must be OFF');
  if (requiresTunnelForExpoGo()) {
    console.log('[auth] ⚠ LAN exp:// is unreliable with Supabase. Use tunnel instead:');
    console.log('[auth]   npx expo start --tunnel --clear');
    console.log('[auth]   Add the https://….exp.direct URL to Redirect URLs + .env:');
    console.log('[auth]   EXPO_PUBLIC_OAUTH_REDIRECT_URI=https://….exp.direct/--/auth/callback');
  }
  console.log('[auth] ── end checklist ──');
}

export function getOAuthRedirectChecklist(): string[] {
  const uri = getOAuthRedirectUri();
  const projectRef =
    process.env.EXPO_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ??
    'YOUR_PROJECT_REF';

  const items = [
    `Add to Supabase Redirect URLs (exact): ${uri}`,
    `Site URL: ${getRecommendedSupabaseSiteUrl()} (NOT http://localhost:3000 on mobile)`,
    `Google Cloud redirect: https://${projectRef}.supabase.co/auth/v1/callback`,
    'OAuth Server (BETA) must be OFF',
  ];

  if (requiresTunnelForExpoGo()) {
    items.unshift(
      'Run: npx expo start --tunnel — then set EXPO_PUBLIC_OAUTH_REDIRECT_URI to the https URL',
    );
  }

  return items;
}

export function isSupabaseRedirectConfigError(message: string): boolean {
  return (
    /requested path is invalid|redirect.*invalid|redirect.*not allowed|localhost.*connect|refused to connect|tunnel mode/i.test(
      message,
    )
  );
}

export function isOAuthSiteUrlFallback(url: string): boolean {
  return /localhost|127\.0\.0\.1/.test(url) && !urlHasOAuthParams(url);
}

export function isOAuthRedirectUrl(url: string): boolean {
  if (url.startsWith('pcos://auth/callback')) return urlHasOAuthParams(url);
  if (url.includes('/auth/callback') && urlHasOAuthParams(url)) return true;
  if (url.includes('.exp.direct') && urlHasOAuthParams(url)) return true;

  const base = getOAuthRedirectUri().split('?')[0]?.split('#')[0] ?? '';
  if (base && url.startsWith(base) && urlHasOAuthParams(url)) return true;

  return /^exp:\/\/[^/?#]+[?#]/.test(url) && urlHasOAuthParams(url);
}

export function getExpoDevHost(): string | undefined {
  return Constants.expoConfig?.hostUri ?? undefined;
}
