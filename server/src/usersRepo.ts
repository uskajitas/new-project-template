import { getDb } from './db';
import { notifyAdmin } from './notify';

export type Role = 'admin' | 'pro' | 'guest';

export interface AppUser {
  email: string;
  name: string;
  picture: string;
  role: Role;
  approved: boolean;
  trialUsed: number;
  createdAt: string;
  lastLoginAt: string;
}

const TABLE = '__PROJECT_DB___users';

// How many trial actions a non-admin gets on cost-incurring features before
// being blocked (see checkAndUseTrial below). Only meaningful for projects
// that actually call it — most projects have no paid actions and never do.
const TRIAL_LIMIT = 3;

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS || '')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

// PUBLIC_SIGNUP=true opens sign-in to anyone (portfolio/resume mode) instead
// of the fixed ALLOWED_EMAILS list. Default is unset/false — existing
// projects keep today's allowlist-only behavior unless this is turned on.
function publicSignup(): boolean {
  return (process.env.PUBLIC_SIGNUP || '').toLowerCase() === 'true';
}

export function isAllowed(email: string): boolean {
  if (publicSignup()) return true;
  return allowedEmails().includes(email.toLowerCase());
}

export function isAdminEmail(email: string): boolean {
  return adminEmails().includes(email.toLowerCase());
}

export async function listUsers(): Promise<AppUser[]> {
  const { rows } = await getDb().query(`SELECT * FROM ${TABLE} ORDER BY "createdAt" ASC`);
  return rows;
}

export async function getUser(email: string): Promise<AppUser | null> {
  const { rows } = await getDb().query(`SELECT * FROM ${TABLE} WHERE email = $1`, [email.toLowerCase()]);
  return rows[0] || null;
}

/**
 * Called on every successful Firebase sign-in. Creates the user row on
 * first login, refreshes name/picture/lastLoginAt every time after.
 * If the email is in ADMIN_EMAILS, role is forced to 'admin'.
 */
export async function upsertOnLogin(email: string, name: string, picture: string): Promise<AppUser> {
  const e = email.toLowerCase();
  const db = getDb();
  const existing = await getUser(e);

  if (existing) {
    const role = isAdminEmail(e) ? 'admin' : existing.role;
    const { rows } = await db.query(
      `UPDATE ${TABLE}
       SET name = $1, picture = $2, role = $3, "lastLoginAt" = NOW()
       WHERE email = $4 RETURNING *`,
      [name, picture, role, e],
    );
    return rows[0];
  }

  const role: Role = isAdminEmail(e) ? 'admin' : 'guest';
  const { rows } = await db.query(
    `INSERT INTO ${TABLE} (email, name, picture, role) VALUES ($1, $2, $3, $4) RETURNING *`,
    [e, name, picture, role],
  );

  // First time this project has ever seen this email. Only worth an email
  // in public-signup mode (a stranger showing up) — not for the two admin
  // accounts, and not on every ordinary allowlisted login elsewhere.
  if (publicSignup() && !isAdminEmail(e)) {
    notifyAdmin(
      `New sign-in on __PROJECT_NAME__: ${e}`,
      `${name || e} (${e}) just signed in to __PROJECT_NAME__ for the first time.\n\nRole: guest (trial limit: ${TRIAL_LIMIT} actions on any paid feature).`,
    ); // fire-and-forget — never awaited, must not slow down or fail login
  }

  return rows[0];
}

/**
 * For projects with real per-action cost (e.g. AI generation calls). Call
 * this BEFORE running the costly action. Admins are never limited. Returns
 * { ok: true } and increments the counter on success; { ok: false, used,
 * limit } once a non-admin guest has used up their free trial — the caller
 * should block the action and show that message, spending nothing further.
 */
export async function checkAndUseTrial(email: string): Promise<{ ok: true } | { ok: false; used: number; limit: number }> {
  const e = email.toLowerCase();
  if (isAdminEmail(e)) return { ok: true };
  const user = await getUser(e);
  if (!user) return { ok: false, used: 0, limit: TRIAL_LIMIT };
  if (user.role === 'admin' || user.role === 'pro') return { ok: true };
  if (user.trialUsed >= TRIAL_LIMIT) return { ok: false, used: user.trialUsed, limit: TRIAL_LIMIT };
  await getDb().query(`UPDATE ${TABLE} SET "trialUsed" = "trialUsed" + 1 WHERE email = $1`, [e]);
  return { ok: true };
}

export async function addUser(email: string, role: Role): Promise<AppUser> {
  const e = email.toLowerCase();
  const finalRole: Role = isAdminEmail(e) ? 'admin' : role;
  const { rows } = await getDb().query(
    `INSERT INTO ${TABLE} (email, role) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
     RETURNING *`,
    [e, finalRole],
  );
  return rows[0];
}

export async function setRole(email: string, role: Role): Promise<AppUser | null> {
  const e = email.toLowerCase();
  // ADMIN_EMAILS always wins — can't demote a bootstrap admin via the UI.
  if (isAdminEmail(e) && role !== 'admin') {
    const u = await getUser(e);
    return u;
  }
  const { rows } = await getDb().query(
    `UPDATE ${TABLE} SET role = $1 WHERE email = $2 RETURNING *`,
    [role, e],
  );
  return rows[0] || null;
}

export async function removeUser(email: string): Promise<boolean> {
  const e = email.toLowerCase();
  // Don't allow removing a bootstrap admin from the UI.
  if (isAdminEmail(e)) return false;
  const { rowCount } = await getDb().query(`DELETE FROM ${TABLE} WHERE email = $1`, [e]);
  return (rowCount ?? 0) > 0;
}
