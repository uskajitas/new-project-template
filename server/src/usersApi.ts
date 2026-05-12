import { Router, Request, Response, NextFunction } from 'express';
import {
  addUser, isAdminEmail, isAllowed, listUsers, removeUser,
  setRole, upsertOnLogin, getUser, Role,
} from './usersRepo';

const router = Router();

// ── Auth-on-the-cheap ────────────────────────────────────────────────────────
// The client sends `x-user-email` on every protected request. The server
// looks it up in the DB and uses the row's role for gating. This is NOT
// cryptographic — anyone who knows an allowlisted email can spoof.
// TODO before public launch: replace with Firebase Admin SDK ID-token
// verification on every request. Pattern doc: README.md "Hardening".

function userFromHeader(req: Request): string | null {
  const h = req.header('x-user-email');
  return h ? h.toLowerCase() : null;
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const email = userFromHeader(req);
  if (!email) return res.status(401).json({ error: 'no user' });
  if (!isAllowed(email)) return res.status(403).json({ error: 'not allowed' });
  if (isAdminEmail(email)) return next();
  const u = await getUser(email);
  if (u?.role === 'admin') return next();
  return res.status(403).json({ error: 'admin only' });
}

// ── Public auth endpoint ─────────────────────────────────────────────────────
// Client posts after Firebase sign-in. If email is not allowed, 403.
router.post('/auth/login', async (req, res) => {
  const { email, name = '', picture = '' } = req.body || {};
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'missing email' });
  if (!isAllowed(email)) return res.status(403).json({ error: 'email not allowed' });
  const u = await upsertOnLogin(email, name, picture);
  return res.json(u);
});

// ── Admin-only user management ───────────────────────────────────────────────
router.get('/users', requireAdmin, async (_req, res) => {
  res.json(await listUsers());
});

router.post('/users', requireAdmin, async (req, res) => {
  const { email, role = 'guest' } = req.body || {};
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'missing email' });
  if (!['admin', 'pro', 'guest'].includes(role)) return res.status(400).json({ error: 'invalid role' });
  res.json(await addUser(email, role as Role));
});

router.put('/users/:email', requireAdmin, async (req, res) => {
  const { role } = req.body || {};
  if (!['admin', 'pro', 'guest'].includes(role)) return res.status(400).json({ error: 'invalid role' });
  const u = await setRole(req.params.email, role);
  if (!u) return res.status(404).json({ error: 'not found' });
  res.json(u);
});

router.delete('/users/:email', requireAdmin, async (req, res) => {
  const ok = await removeUser(req.params.email);
  if (!ok) return res.status(400).json({ error: 'cannot remove (bootstrap admin or not found)' });
  res.json({ ok: true });
});

export default router;
