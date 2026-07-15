/**
 * Types for the public Expo env vars this app reads.
 * Only EXPO_PUBLIC_* vars are exposed to the client bundle.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_SUPABASE_URL: string;
    readonly EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    /** Optional override for Google OAuth redirect (e.g. Expo tunnel URL). */
    readonly EXPO_PUBLIC_OAUTH_REDIRECT_URI?: string;
  }
}
