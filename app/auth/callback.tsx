import { useGlobalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useRef } from 'react';

import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { buildOAuthCallbackUrl } from '@/features/auth/buildOAuthCallbackUrl';
import { logOAuthStep, logOAuthStepError, sanitizeOAuthUrl } from '@/features/auth/authDebugLog';
import { createSessionFromOAuthUrl } from '@/features/auth/googleOAuth';
import { isOAuthRedirectUrl } from '@/features/auth/oauthRedirect';

const OAUTH_CALLBACK_TIMEOUT_MS = 12_000;

/** Handles OAuth deep links such as exp://…?code=… */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const linkingUrl = Linking.useURL();
  const handledRef = useRef(false);

  useEffect(() => {
    logOAuthStep('callback-screen.mount', {
      linkingUrl: sanitizeOAuthUrl(linkingUrl),
      paramKeys: Object.keys(params).join(', ') || '(none)',
    });
  }, [linkingUrl, params]);

  useEffect(() => {
    async function finishOAuth() {
      if (handledRef.current) return;

      const initialUrl = await Linking.getInitialURL();
      const callbackUrl = buildOAuthCallbackUrl(linkingUrl ?? initialUrl, params);
      const matches = Boolean(callbackUrl && isOAuthRedirectUrl(callbackUrl));

      logOAuthStep('callback-screen.evaluated', {
        initialUrl: sanitizeOAuthUrl(initialUrl),
        linkingUrl: sanitizeOAuthUrl(linkingUrl),
        callbackUrl: sanitizeOAuthUrl(callbackUrl),
        matches,
      });

      if (!callbackUrl || !matches) {
        return;
      }

      handledRef.current = true;
      try {
        await createSessionFromOAuthUrl(callbackUrl, 'callback-screen');
        logOAuthStep('callback-screen.success');
        router.replace('/');
      } catch (error) {
        logOAuthStepError('callback-screen', error);
        router.replace('/(auth)/sign-in');
      }
    }

    void finishOAuth();
  }, [linkingUrl, params, router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (handledRef.current) return;
      logOAuthStep('callback-screen.timeout', { afterMs: OAUTH_CALLBACK_TIMEOUT_MS });
      router.replace('/(auth)/sign-in');
    }, OAUTH_CALLBACK_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [router]);

  return <LoadingScreen />;
}
