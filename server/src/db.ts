import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDb(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL not set');
    const isLocal = /@(localhost|127\.0\.0\.1)/.test(url);
    pool = new Pool({
      connectionString: url,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    pool.on('error', (err) => {
      console.error('[db] pool error (will reconnect):', err.message);
    });
  }
  return pool;
}

export async function initDb(): Promise<void> {
  const db = getDb();
  await db.query(`
    CREATE TABLE IF NOT EXISTS __PROJECT_DB___users (
      email         TEXT PRIMARY KEY,
      name          TEXT NOT NULL DEFAULT '',
      picture       TEXT NOT NULL DEFAULT '',
      role          TEXT NOT NULL DEFAULT 'guest',
      approved      BOOLEAN NOT NULL DEFAULT TRUE,
      "trialUsed"   INTEGER NOT NULL DEFAULT 0,
      "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "lastLoginAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Added after the table may already exist on older deployments.
  await db.query(`ALTER TABLE __PROJECT_DB___users ADD COLUMN IF NOT EXISTS "trialUsed" INTEGER NOT NULL DEFAULT 0;`);

  // Generic key/value settings — secrets and small config that shouldn't live
  // in .env (e.g. a Resend API key shared across projects). See settings.ts.
  await db.query(`
    CREATE TABLE IF NOT EXISTS __PROJECT_DB___settings (
      key         TEXT PRIMARY KEY,
      value       TEXT NOT NULL DEFAULT '',
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Anonymous page-view counter for resume/portfolio traffic. No login
  // required, no third-party script, IP is hashed (not stored raw).
  await db.query(`
    CREATE TABLE IF NOT EXISTS __PROJECT_DB___page_views (
      id          BIGSERIAL PRIMARY KEY,
      path        TEXT NOT NULL,
      referrer    TEXT NOT NULL DEFAULT '',
      "userAgent" TEXT NOT NULL DEFAULT '',
      "ipHash"    TEXT NOT NULL DEFAULT '',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS __PROJECT_DB___page_views_created_idx ON __PROJECT_DB___page_views ("createdAt");`);

  console.log('[db] __PROJECT_DB___ tables ready (users, settings, page_views)');
}
