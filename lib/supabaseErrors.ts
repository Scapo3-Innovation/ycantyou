import type { PostgrestError } from '@supabase/supabase-js';

/** True when the dev DB is missing tables/columns/RPCs (migration not applied yet). */
export function isSchemaNotReadyError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const e = error as PostgrestError & { status?: number };
  const code = e.code ?? '';
  const message = (e.message ?? '').toLowerCase();
  const details = (e.details ?? '').toLowerCase();

  if (code === 'PGRST202') return true; // RPC/function not found
  if (code === 'PGRST204') return true; // column not in schema cache
  if (code === 'PGRST205') return true; // table not in schema cache
  if (code === '42P01') return true; // undefined_table
  if (code === '42883') return true; // undefined_function

  return (
    message.includes('could not find the function') ||
    message.includes('could not find the table') ||
    message.includes('does not exist') ||
    message.includes('schema cache') ||
    details.includes('does not exist')
  );
}

export function schemaNotReadyMessage(feature: string): string {
  return `${feature} is not set up on this server yet. Ask your developer to run the latest database migrations (npm run db:patch).`;
}

/** True when fetch failed because the Supabase hostname could not be resolved. */
export function isUnreachableHostError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? `${error.message} ${error.name}`
      : typeof error === 'string'
        ? error
        : JSON.stringify(error);

  const lower = message.toLowerCase();
  return (
    lower.includes('unknownhostexception') ||
    lower.includes('no address associated with hostname') ||
    lower.includes('unable to resolve host') ||
    lower.includes('enotfound') ||
    lower.includes('getaddrinfo')
  );
}

export function unreachableSupabaseMessage(host: string): string {
  return (
    `Can't reach Supabase at ${host}. ` +
    'Check EXPO_PUBLIC_SUPABASE_URL in .env — use the Project URL from Supabase → Settings → API. ' +
    'Then stop the dev server and run: npx expo start --clear'
  );
}
