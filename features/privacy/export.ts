import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { Platform } from 'react-native';

import { shareLocalFile } from '@/lib/shareLocalFile';
import { supabase } from '@/lib/supabase';

/**
 * DPDP data export. Gathers all of the signed-in user's own rows (RLS scopes every read to
 * them) and lets her share it as machine-readable JSON or a human-readable PDF summary.
 */

type ExportBundle = {
  exported_at: string;
  app: string;
  profile: unknown;
  consents: unknown[];
  cycles: unknown[];
  daily_logs: unknown[];
  lab_results: unknown[];
  screener_responses: unknown[];
  screener_results: unknown[];
  bookmarks: unknown[];
  community: {
    posts: unknown[];
    comments: unknown[];
    likes: unknown[];
    dislikes: unknown[];
    comment_likes: unknown[];
    blocks: unknown[];
    profile: unknown | null;
  };
};

async function rows(
  table: string,
  userId: string,
  options: { column?: string; select?: string; notDeleted?: boolean } = {},
): Promise<unknown[]> {
  const column = options.column ?? 'user_id';
  let query = supabase.from(table).select(options.select ?? '*').eq(column, userId);
  if (options.notDeleted) query = query.is('deleted_at', null);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function optionalRows(
  table: string,
  userId: string,
  options: { column?: string; select?: string; notDeleted?: boolean } = {},
): Promise<unknown[]> {
  try {
    return await rows(table, userId, options);
  } catch {
    return [];
  }
}

/** Read everything we hold about the user into one bundle. */
export async function gatherUserData(userId: string, generatedAt: string): Promise<ExportBundle> {
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (profileErr) throw profileErr;

  const [
    consents,
    cycles,
    daily_logs,
    lab_results,
    screener_responses,
    screener_results,
    bookmarks,
    posts,
    comments,
    likes,
    dislikes,
    comment_likes,
    blocks,
    community_profile,
  ] = await Promise.all([
    rows('consents', userId),
    rows('cycles', userId, { notDeleted: true }),
    rows('daily_logs', userId, { select: '*, daily_log_symptoms(*)', notDeleted: true }),
    rows('lab_results', userId, { notDeleted: true }),
    rows('screener_responses', userId),
    rows('screener_results', userId),
    rows('content_bookmarks', userId),
    rows('community_posts', userId, { notDeleted: true }),
    rows('community_comments', userId, { notDeleted: true }),
    rows('community_likes', userId),
    optionalRows('community_dislikes', userId),
    optionalRows('community_comment_likes', userId),
    rows('community_blocks', userId, { column: 'blocker_id' }),
    supabase
      .from('community_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => (error ? null : data)),
  ]);

  return {
    exported_at: generatedAt,
    app: 'PCOS / Women’s Health App',
    profile,
    consents,
    cycles,
    daily_logs,
    lab_results,
    screener_responses,
    screener_results,
    bookmarks,
    community: {
      posts,
      comments,
      likes,
      dislikes,
      comment_likes,
      blocks,
      profile: community_profile,
    },
  };
}

/** Write the full export as JSON and open the share sheet. Returns false if sharing is unavailable. */
export async function exportAsJson(bundle: ExportBundle): Promise<boolean> {
  const uri = `${FileSystem.cacheDirectory}pcos-data-export.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(bundle, null, 2));
  return shareLocalFile(uri, {
    mimeType: 'application/json',
    dialogTitle: 'Your data export',
    UTI: 'public.json',
  });
}

/** Render a readable PDF summary of the export and open the share sheet. */
export async function exportAsPdf(bundle: ExportBundle): Promise<boolean> {
  const date = bundle.exported_at.slice(0, 10);
  const counts: [string, number][] = [
    ['Cycles', bundle.cycles.length],
    ['Daily logs', bundle.daily_logs.length],
    ['Lab results', bundle.lab_results.length],
    ['Screener responses', bundle.screener_responses.length],
    ['Screener results', bundle.screener_results.length],
    ['Saved articles', bundle.bookmarks.length],
    ['Community posts', bundle.community.posts.length],
    ['Community comments', bundle.community.comments.length],
    ['Consents on record', bundle.consents.length],
  ];
  const rowsHtml = counts.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <style>
      body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color:#1C1C1E; padding:24px; }
      h1 { font-size:22px; margin:0 0 4px; }
      .muted { color:#6E7178; font-size:12px; }
      table { width:100%; border-collapse:collapse; font-size:13px; margin-top:12px; }
      td { padding:6px 8px; border-bottom:1px solid #ECEEF1; }
      td:last-child { text-align:right; font-weight:600; }
    </style></head>
    <body>
      <h1>Your data — summary</h1>
      <div class="muted">Exported ${date}. The full machine-readable copy is in the JSON export.</div>
      <table>${rowsHtml}</table>
      <p class="muted">This is your own data, held privately. We never sell it.</p>
    </body></html>`;

  const { uri, base64 } = await Print.printToFileAsync({
    html,
    base64: Platform.OS === 'android',
  });
  return shareLocalFile(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Your data summary',
    UTI: 'com.adobe.pdf',
    ...(Platform.OS === 'android' && base64 ? { base64 } : {}),
  });
}
