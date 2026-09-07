import { Router } from 'express';
import crypto from 'node:crypto';
import { getDb } from './db';
import { isAdminEmail } from './usersRepo';

const router = Router();
const TABLE = '__PROJECT_DB___page_views';

// Hash the IP instead of storing it raw — enough to dedupe/rate-limit later
// without keeping a visitor's actual address around.
function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + '__PROJECT_DB__-salt').digest('hex').slice(0, 16);
}

function clientIp(req: any): string {
  const fwd = req.header('x-forwarded-for');
  return (fwd ? fwd.split(',')[0].trim() : req.socket?.remoteAddress) || 'unknown';
}

// Public, no auth — called by the client beacon on every page load. Never
// blocks or errors loudly; a broken tracker must never affect the page.
router.post('/track/pageview', async (req, res) => {
  try {
    const { path: p = '', referrer = '' } = req.body || {};
    await getDb().query(
      `INSERT INTO ${TABLE} (path, referrer, "userAgent", "ipHash") VALUES ($1, $2, $3, $4)`,
      [String(p).slice(0, 500), String(referrer).slice(0, 500), (req.header('user-agent') || '').slice(0, 300), hashIp(clientIp(req))],
    );
  } catch (e) {
    console.error('[track] pageview insert failed (non-fatal):', e);
  }
  res.status(204).end();
});

// Admin-only — simple aggregate for checking resume traffic.
router.get('/track/stats', async (req, res) => {
  const email = (req.header('x-user-email') || '').toLowerCase();
  if (!isAdminEmail(email)) return res.status(403).json({ error: 'admin only' });

  const db = getDb();
  const [total, last7d, byPath, byDay] = await Promise.all([
    db.query(`SELECT count(*)::int AS n FROM ${TABLE}`),
    db.query(`SELECT count(*)::int AS n FROM ${TABLE} WHERE "createdAt" > NOW() - INTERVAL '7 days'`),
    db.query(`SELECT path, count(*)::int AS n FROM ${TABLE} GROUP BY path ORDER BY n DESC LIMIT 20`),
    db.query(`SELECT date_trunc('day', "createdAt")::date AS day, count(*)::int AS n FROM ${TABLE} WHERE "createdAt" > NOW() - INTERVAL '30 days' GROUP BY 1 ORDER BY 1`),
  ]);
  res.json({
    total: total.rows[0].n,
    last7Days: last7d.rows[0].n,
    byPath: byPath.rows,
    byDay: byDay.rows,
  });
});

export default router;
