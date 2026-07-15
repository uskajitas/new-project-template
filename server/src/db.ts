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
      "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "lastLoginAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log('[db] __PROJECT_DB___users table ready');
}
