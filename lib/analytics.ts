/**
 * Analytics — a thin wrapper around PostHog for the product funnel.
 *
 * Privacy rules (CLAUDE.md):
 *  - NEVER pass health data (symptom values, scores, dates, cycle data) as event props.
 *    Callers send event names + non-sensitive metadata only.
 *  - Disabled by default: with no EXPO_PUBLIC_POSTHOG_KEY, every call is a no-op and the
 *    native module is never loaded (Expo Go-safe).
 */

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

type Props = Record<string, string | number | boolean>;

type Client = {
  capture: (event: string, props?: Props) => void;
  identify: (id: string) => void;
  reset: () => void;
};

let client: Client | null = null;
let initialized = false;

function getClient(): Client | null {
  if (!POSTHOG_KEY) return null;
  if (!initialized) {
    initialized = true;
    try {
      // Lazy require so PostHog is only loaded when analytics is actually enabled.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PostHog } = require('posthog-react-native');
      client = new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST }) as Client;
    } catch {
      client = null;
    }
  }
  return client;
}

export const analytics = {
  /** Associate subsequent events with a user (UUID only — not PII). */
  identify(userId: string): void {
    getClient()?.identify(userId);
  },
  /** Record a funnel event. Never include health data in props. */
  track(event: string, props?: Props): void {
    getClient()?.capture(event, props);
  },
  /** Clear the identity on sign-out. */
  reset(): void {
    getClient()?.reset();
  },
};
