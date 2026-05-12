import { getDb } from './db';

export type Role = 'admin' | 'pro' | 'guest';

export interface AppUser {
  email: string;
  name: string;
  picture: string;
  role: Role;
  approved: boolean;
  createdAt: string;
  lastLoginAt: string;
}

const TABLE = '__PROJECT_NAME___users';

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS || '')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isAllowed(email: string): boolean {
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
  return rows[0];
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
