// Tiny fetch wrapper. Always relative — Vite proxy handles routing to backend in dev,
// Cloudflare tunnel handles it in prod.
//
// We stash the signed-in email at module scope so every request can attach
// the `x-user-email` header. UserContext calls setCurrentEmail() after sign-in
// and clears it on sign-out.

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

  const res = await fetch(path, { ...init, headers });
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
