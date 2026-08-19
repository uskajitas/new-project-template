// Tiny fetch wrapper. In dev, paths are relative and the Vite proxy forwards
// /api -> localhost:backend. In prod, top-level-domain projects serve the app
// from the apex (e.g. foo.com) while the API lives on api.foo.com, so we must
// call it with an absolute base — a same-origin /api call would hit the static
// site and return index.html, which is the classic "login loop" (auth/me
// returns HTML, user resolves to null, RequireAuth bounces to /login). The base
// is injected at build time via VITE_API_BASE (client/.env.production, written
// by scripts/new-project.ps1 for Layout A). Empty falls back to same-origin,
// which is correct for dev and for subdomain (Layout B) projects.
const API_BASE = ((import.meta as any).env?.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') || '';

let currentEmail: string | null = null;

export function setCurrentEmail(email: string | null) {
  currentEmail = email ? email.toLowerCase() : null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> || {}),
  };
  if (currentEmail) headers['x-user-email'] = currentEmail;

  const res = await fetch(API_BASE + path, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export const api = {
  get:  <T>(path: string)            => request<T>(path),
  post: <T>(path: string, body: any) => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:  <T>(path: string, body: any) => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  del:  <T>(path: string)            => request<T>(path, { method: 'DELETE' }),
};
