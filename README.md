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
