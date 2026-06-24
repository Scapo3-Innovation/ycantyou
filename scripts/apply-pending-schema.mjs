/**
 * Applies supabase/apply-pending.sql to the linked dev project.
 *
 * Usage:
 *   set SUPABASE_DB_PASSWORD=your-db-password
 *   npm run db:patch
 *
 * Find the password in Supabase Dashboard → Project Settings → Database.
 * Or paste supabase/apply-pending.sql into the SQL Editor instead.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sqlPath = join(root, 'supabase', 'apply-pending.sql');
const sql = readFileSync(sqlPath, 'utf8');

function projectRefFromEnv(): string | undefined {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (!url) return undefined;
  try {
    return new URL(url).hostname.split('.')[0];
  } catch {
    return undefined;
  }
}

const password = process.env.SUPABASE_DB_PASSWORD;
const projectRef = projectRefFromEnv() ?? 'YOUR_PROJECT_REF';

if (!password) {
  console.log('Missing SUPABASE_DB_PASSWORD.\n');
  console.log(`Open SQL Editor: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log('\nPaste and run:\n');
  console.log(sql);
  process.exit(1);
}

const connectionString =
  process.env.SUPABASE_DB_URL ??
  `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;

const { default: pg } = await import('pg');
const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log('Applied supabase/apply-pending.sql successfully.');
} catch (error) {
  console.error('Failed to apply schema patch:', error);
  process.exit(1);
} finally {
  await client.end();
}
