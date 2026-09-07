import { getDb } from './db';

const TABLE = '__PROJECT_DB___settings';

// Small key/value store for config that shouldn't live in .env — mainly
// secrets shared across projects (e.g. a Resend API key), so rotating one
// doesn't mean editing 15 .env files. Falls back to an env var of the same
// name if the DB has nothing set, so local dev still works without a row.
export async function getSetting(key: string): Promise<string | null> {
  const { rows } = await getDb().query(`SELECT value FROM ${TABLE} WHERE key = $1`, [key]);
  if (rows[0]?.value) return rows[0].value;
  return process.env[key] || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await getDb().query(
    `INSERT INTO ${TABLE} (key, value, "updatedAt") VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [key, value],
  );
}
