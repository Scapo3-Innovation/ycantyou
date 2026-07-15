import * as WebBrowser from 'expo-web-browser';

import {
  describeOAuthParams,
  logOAuthStep,
  logOAuthStepError,
  sanitizeOAuthUrl,
} from '@/features/auth/authDebugLog';
import {
  getOAuthRedirectUri,
  getRecommendedSupabaseSiteUrl,
  isOAuthSiteUrlFallback,
  logOAuthRedirectUriDebug,
  requiresTunnelForExpoGo,
} from '@/features/auth/oauthRedirect';
import { supabase } from '@/lib/supabase';

async function clearSessionForOAuth(): Promise<void> {
  logOAuthStep('1/8 clearSession.start');
  await supabase.auth.signOut();
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    logOAuthStep('1/8 clearSession.retryLocal', { hadSession: true });
    await supabase.auth.signOut({ scope: 'local' });
  }
  const { data: after } = await supabase.auth.getSession();
  logOAuthStep('1/8 clearSession.done', { sessionCleared: after.session == null });
}

function describeOAuthBrowserError(url: string): string {
  const params = parseOAuthParams(url);
  if (params.error_description) return params.error_description;
  if (params.error) return params.error;
  if (url.includes('.supabase.co')) {
    return (
      'Supabase rejected the redirect URL. Add the exp:// URL from Metro to ' +
      'Supabase → Authentication → URL Configuration → Redirect URLs, then Save.'
    );
  }
  return 'Google sign-in did not complete.';
}

WebBrowser.maybeCompleteAuthSession();

export type GoogleSignInResult = 'success' | 'cancelled';

/** Prevents duplicate PKCE exchanges when WebBrowser and Linking both receive the callback. */
let oauthSessionPromise: Promise<void> | null = null;
let googleOAuthInProgress = false;

/** True while Google OAuth browser flow is active (suppresses sign-out redirects). */
export function isGoogleOAuthInProgress(): boolean {
  return googleOAuthInProgress;
}

function isAlreadyExchangedError(message: string): boolean {
  return /invalid.?grant|already been used|code challenge/i.test(message);
}

async function sessionAlreadyActive(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return data.session != null && !data.session.user.is_anonymous;
}

function parseOAuthParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const hashIndex = url.indexOf('#');
  const beforeHash = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex + 1);
  const queryIndex = beforeHash.indexOf('?');
  const query = queryIndex === -1 ? '' : beforeHash.slice(queryIndex + 1);

  for (const part of [query, hash].filter(Boolean)) {
    for (const [key, value] of new URLSearchParams(part)) {
      params[key] = value;
    }
  }

  return params;
}

/** Exchange the OAuth callback URL for a Supabase session. */
export async function createSessionFromOAuthUrl(
  url: string,
  source: 'browser' | 'linking' | 'callback-screen' = 'browser',
): Promise<void> {
  logOAuthStep('session.create.start', {
    source,
    url: sanitizeOAuthUrl(url),
    ...describeOAuthParams(url),
  });

  if (oauthSessionPromise) {
    logOAuthStep('session.create.waitingOnExistingExchange');
    return oauthSessionPromise;
  }

  oauthSessionPromise = (async () => {
    const params = parseOAuthParams(url);

    const errorCode = params.error;
    if (errorCode) {
      logOAuthStep('session.create.errorInUrl', {
        error: errorCode,
        errorDescription: params.error_description,
      });
      if (errorCode === 'invalid_grant' && (await sessionAlreadyActive())) {
        logOAuthStep('session.create.invalidGrantButSessionActive');
        return;
      }
      throw new Error(params.error_description ?? errorCode);
    }

    const code = params.code;
    if (code) {
      const redirectBase = getOAuthRedirectUri().split('?')[0]?.split('#')[0] ?? getOAuthRedirectUri();
      const attemptUrls = [
        url.includes('code=') ? url : null,
        `${redirectBase}?code=${encodeURIComponent(code)}`,
      ].filter((value): value is string => Boolean(value));

      let lastError: Error | null = null;
      for (const attemptUrl of attemptUrls) {
        logOAuthStep('session.create.exchangeCode.start', {
          usingFullUrl: attemptUrl.includes('code='),
          attemptHost: attemptUrl.split('?')[0],
        });
        const { error } = await supabase.auth.exchangeCodeForSession(attemptUrl);
        if (!error) {
          logOAuthStep('session.create.exchangeCode.done');
          return;
        }
        lastError = error;
        logOAuthStepError('session.create.exchangeCode.attempt', error);
        if (isAlreadyExchangedError(error.message) && (await sessionAlreadyActive())) {
          logOAuthStep('session.create.exchangeCode.alreadyExchangedSessionOk');
          return;
        }
      }

      if (lastError) throw lastError;
      return;
    }

    const accessToken = params.access_token;
    const refreshToken = params.refresh_token;
    if (accessToken && refreshToken) {
      logOAuthStep('session.create.setSession.start');
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        logOAuthStepError('session.create.setSession', error);
        throw error;
      }
      logOAuthStep('session.create.setSession.done');
      return;
    }

    if (await sessionAlreadyActive()) {
      logOAuthStep('session.create.skipNoParamsSessionAlreadyActive');
      return;
    }

    logOAuthStep('session.create.failNoCredentials');
    throw new Error('No auth credentials returned.');
  })();

  try {
    await oauthSessionPromise;
    logOAuthStep('session.create.done', { source });
  } catch (error) {
    logOAuthStepError('session.create', error, { source });
    throw error;
  } finally {
    oauthSessionPromise = null;
  }
}

/** Opens Google OAuth in the system browser and completes the Supabase session. */
export async function signInWithGoogleOAuth(): Promise<GoogleSignInResult> {
  googleOAuthInProgress = true;
  logOAuthStep('0/8 flow.start');

  try {
    await clearSessionForOAuth();

    if (requiresTunnelForExpoGo()) {
      throw new Error(
        'Google sign-in needs Expo tunnel mode. Run: npx expo start --tunnel --clear, ' +
          'add the https://….exp.direct/--/auth/callback URL to Supabase Redirect URLs, ' +
          'set EXPO_PUBLIC_OAUTH_REDIRECT_URI in .env, then restart.',
      );
    }

    logOAuthRedirectUriDebug();
    const redirectTo = getOAuthRedirectUri();
    logOAuthStep('2/8 redirectUri.ready', { redirectTo });

    logOAuthStep('3/8 signInWithOAuth.start');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) {
      logOAuthStepError('3/8 signInWithOAuth', error);
      throw error;
    }
    if (!data.url) {
      logOAuthStep('3/8 signInWithOAuth.failNoUrl');
      throw new Error('Could not start Google sign-in.');
    }

    const redirectMatch = data.url.match(/redirect_to=([^&]+)/);
    logOAuthStep('3/8 signInWithOAuth.done', {
      authorizeHost: sanitizeOAuthUrl(data.url.split('?')[0]),
      redirectToSent: redirectMatch?.[1]
        ? decodeURIComponent(redirectMatch[1])
        : redirectTo,
    });

    logOAuthStep('4/8 openAuthSession.start', { returnUrl: redirectTo });
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    logOAuthStep('5/8 openAuthSession.done', {
      type: result.type,
      url: result.type === 'success' ? sanitizeOAuthUrl(result.url) : undefined,
      ...(result.type === 'success' ? describeOAuthParams(result.url) : {}),
    });

    if (result.type === 'cancel' || result.type === 'dismiss') {
      logOAuthStep('5/8 openAuthSession.cancelled', { type: result.type });
      return 'cancelled';
    }
    if (result.type !== 'success') {
      logOAuthStep('5/8 openAuthSession.unexpectedType', { type: result.type });
      throw new Error('Google sign-in did not complete.');
    }

    if (isOAuthSiteUrlFallback(result.url)) {
      const redirectTo = getOAuthRedirectUri();
      const siteUrl = getRecommendedSupabaseSiteUrl();
      logOAuthStep('5/8 FAIL siteUrlFallback', { url: sanitizeOAuthUrl(result.url), redirectTo });
      throw new Error(
        `Supabase opened localhost instead of the app. In Supabase → Auth → URL Configuration: ` +
          `set Site URL to ${siteUrl}, add Redirect URL ${redirectTo}, Save, then retry. ` +
          `Or use: npx expo start --tunnel with EXPO_PUBLIC_OAUTH_REDIRECT_URI in .env.`,
      );
    }

    if (result.url.includes('.supabase.co') && result.url.includes('code=')) {
      logOAuthStep('5/8 openAuthSession.supabaseFallbackWithCode', describeOAuthParams(result.url));
      logOAuthStep('5/8 FIX if this fails: add redirect URLs from checklist, Site URL=http://localhost:3000');
    }

    if (result.url.includes('.supabase.co') && result.url.includes('error')) {
      const message = describeOAuthBrowserError(result.url);
      logOAuthStep('5/8 openAuthSession.supabaseErrorPage', { message });
      throw new Error(message);
    }

    logOAuthStep('6/8 createSession.start');
    await createSessionFromOAuthUrl(result.url, 'browser');
    logOAuthStep('7/8 flow.success');
    return 'success';
  } catch (error) {
    logOAuthStepError('8/8 flow', error);
    throw error;
  } finally {
    googleOAuthInProgress = false;
    logOAuthStep('8/8 flow.end');
  }
}
