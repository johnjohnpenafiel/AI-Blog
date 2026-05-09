---
status: done
started: 2026-05-09
completed: 2026-05-09
---

# Feature: auth-login

## Goal
Seeded admin signs in via NextAuth credentials and reaches `/dashboard`. The Next.js auth gate (`proxy.ts`, renamed from `middleware.ts` in Next 16) redirects unauthenticated `/dashboard/*` requests to `/login` with `callbackUrl` preserved. Session TTL is 2 hours absolute.

## Scope
- **Backend**: `POST /auth/login` + `POST /auth/logout` (FastAPI, bcrypt verify via `passlib`).
- **NextAuth**: credentials provider, JWT strategy, 2-hour `maxAge`, `NEXTAUTH_SECRET` wiring, `SessionProvider` in root layout.
- **Login page**: `/(auth)/login` — email + password form per `Design/README.md`, error state, submit calls `signIn("credentials")`.
- **Auth gate**: `proxy.ts` redirects unauthenticated `/dashboard/*` to `/login` with `callbackUrl`. Placeholder `/dashboard/page.tsx` confirms the flow end-to-end.

## Out of scope
- Registration / sign-up flow, password reset UI, "forgot password" link, "remember me" checkbox. Single admin only — password resets go through `backend/scripts/reset_admin_password.py`.
- Multi-user roles / RBAC / editor or contributor accounts.
- Dashboard sidebar, logout button styling, pipeline status dot, stat cards — anything inside `/dashboard` beyond the auth gate. Real shell ships in `dashboard-shell-and-overview`.
- Session refresh / sliding expiration / activity-based extension. 2h is a hard absolute cap.
  - **Note**: sliding 2h-idle is a future option if real usage hurts. ~5-line change in the NextAuth JWT callback, no schema change. Revisit only if the admin actually gets kicked out mid-task.

## Success criteria
- [x] Valid creds → land on `/dashboard`; wrong password → error rendered on `/login`, stays on `/login`.
- [x] Hitting `/dashboard` while logged out → redirected to `/login?callbackUrl=/dashboard`; signing in returns to the original path.
- [x] Session cookie / JWT shows ~2h expiry in devtools.
- [x] Backend pytest covers `/auth/login` (valid, unknown email, wrong password) + `/auth/logout` against real Postgres.

## Tasks

### Backend (FastAPI)
- [x] Add Pydantic schemas: `LoginRequest` (email, password), `LoginResponse` (id, email)
- [x] Add `POST /auth/login` — validates creds via `passlib` bcrypt, 200 with user JSON on success, 401 on bad creds
- [x] Add `POST /auth/logout` — no-op endpoint (NextAuth owns the session; included for symmetry with PLANNING.md API contract)
- [x] Backend tests: valid creds, unknown email (401), wrong password (401), logout (200) — against real Postgres per CLAUDE.md

### NextAuth wiring
- [x] Install `next-auth` in frontend
- [x] Create `/api/auth/[...nextauth]/route.ts` with credentials provider, JWT strategy, `maxAge: 60 * 60 * 2`
- [x] `authorize()` callback POSTs to FastAPI `/auth/login`; returns user on 200, null on 401
- [x] Generate `NEXTAUTH_SECRET`, add to `frontend/.env.local` and `frontend/.env.example` (separate from root `.env` per locked decision)
- [x] Wrap root layout in `SessionProvider` (via `Providers` Client Component)
- [x] Document NextAuth↔FastAPI session pattern in PLANNING.md decision log (NextAuth owns the session JWT; FastAPI is stateless)

### Login page
- [x] Create `src/app/(auth)/login/page.tsx` — centered card, top-left bracket, monospaced labels per `Design/README.md`
- [x] Email + password form, accent blue `SIGN IN` button (uses shadcn `Button` + `Input` with token aliases in `globals.css`)
- [x] Submit → `signIn("credentials", { redirect: false })`; on success, push to `callbackUrl` or `/dashboard`
- [x] Error state: render error message on 401 from `signIn`

### Auth gate
- [x] Add `frontend/src/proxy.ts` (Next 16 renames `middleware.ts` → `proxy.ts`) protecting `/dashboard/*`; redirect unauthed → `/login?callbackUrl=...`
- [x] Add placeholder `/dashboard/page.tsx` that renders "Signed in as <email>" + logout link (real shell ships in `dashboard-shell-and-overview`)
- [x] Logout link calls `signOut({ callbackUrl: "/login" })`

## Verification
- [x] Programmatic walkthrough via curl: logged-out `/dashboard` → 307 → `/login?callbackUrl=%2Fdashboard`; CSRF + credentials POST → session cookie set; `/api/auth/session` returns the seeded admin; logged-in `/dashboard` → 200. *(Full browser click-through still recommended for the visual login form per `Design/README.md`.)*
- [x] Backend pytest: `docker compose run --rm backend pytest` — 12/12 green including 4 auth cases
- [x] Session-token cookie `Max-Age` confirmed = 7200s (= 2h exactly) via curl cookie jar
- [x] Frontend `npm run lint` + `npm run typecheck` + `npm run build` all pass
