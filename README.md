# new-project-template

Minimal but functional scaffold for a new project under the `uskajitas`
home-server stack. Stack: Vite React + styled-components + Express +
ts-node-dev + WSL2 Postgres + Firebase Auth (Google sign-in).

**Do not clone this directly.** This template is consumed by an agent
following the `SETUP_NEW_PROJECT_SKILL.md` skill in the `agent_skill`
repo. The skill clones this, replaces placeholders, allocates ports,
sets up the tunnel + DB + PM2, and pushes to your real project repo.

## What you get when set up

- Landing page (public)
- Login page (Google sign-in via Firebase)
- Dashboard page (signed-in)
- Users page (admin-only) — add / remove users, change roles
- Email allowlist enforced server-side (`ADMIN_EMAILS` env)
- Roles: `admin`, `pro`, `guest` (default `guest`)
- Auto-created on first login: `uskajitas@gmail.com` = admin, `usquiano@gmail.com` = guest
- **Anonymous page-view counter** (`<slug>_page_views` table, `/api/track/pageview`
  beacon on every route change, `/api/track/stats` admin-only summary) — on by
  default, no login needed, no third-party script.
- **Public sign-in mode** (`PUBLIC_SIGNUP=true` in `server/.env`) — opens
  sign-in to anyone instead of the `ALLOWED_EMAILS` list, for portfolio/resume
  projects. Off by default (existing allowlist behavior unchanged). New
  sign-ins land as `guest`; the site owner gets an email (via `notify.ts` /
  Resend) the first time each new person signs in.
- **Trial cap for costly actions** (`checkAndUseTrial(email)` in
  `usersRepo.ts`) — call it before any action that costs money (an AI
  generation call, etc). Non-admin guests get 3 free uses total, then it's
  blocked until the owner promotes their role. Admins are never limited. Only
  matters for projects that actually call it — most don't.
- **`settings.ts`** — generic key/value store per project (`<slug>_settings`
  table) for secrets that shouldn't live in `.env` (e.g. `RESEND_API_KEY`),
  so rotating one doesn't mean editing every project's `.env`.

## Placeholders the agent will replace

| Placeholder | Example | What it is |
|---|---|---|
| `__PROJECT_NAME__` | `mynewapp` | lowercase slug — folder, db, table prefix, npm name |
| `__PROJECT_DISPLAY__` | `My New App` | human-readable title |
| `__PROJECT_PORT_FRONTEND__` | `3160` | Vite port |
| `__PROJECT_PORT_BACKEND__` | `8160` | Express port |
| `__PROJECT_DOMAIN__` | `mynewapp.com` | public hostname (or subdomain) |

Run a recursive grep for `__PROJECT_` to confirm every placeholder is replaced
before launch.
