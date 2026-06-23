/**
 * Types for the public Expo env vars this app reads.
 * Only EXPO_PUBLIC_* vars are exposed to the client bundle.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_SUPABASE_URL: string;
    readonly EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
  }
}
