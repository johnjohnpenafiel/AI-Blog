---
status: done
started: 2026-05-29
completed: 2026-05-29
---

# Feature: backend-auth

## Goal
Close the open admin/write surface: require a credential on the backend's protected
endpoints so the FastAPI service can no longer be driven by unauthenticated requests,
and gate the Next.js proxy on the NextAuth session so it can't be used as an open relay.

## Scope
- A FastAPI dependency (`require_api_key`) that checks `Authorization: Bearer <BACKEND_API_SECRET>`
  and returns 401 on a missing/incorrect header.
- Apply it (router-level) to the protected routers: `posts`, `pipeline`, `settings`.
- Each Next.js `/api/*` route that proxies a protected backend endpoint: verify the NextAuth
  session (`getToken`) first → 401 if logged out; then attach the Bearer secret on the
  server-to-server `fetch` (secret never reaches the browser).
- A shared proxy helper so the session-check + header logic isn't copy-pasted across ~11 routes.
- `BACKEND_API_SECRET` added to `.env` / `.env.example` and documented as a required prod env
  var on both Render (backend) and Vercel (frontend).
- pytest coverage for the new behavior.

## Out of scope
- Still a single admin — no multi-user, no roles, no per-user identity.
- No secret rotation / expiry / key-management system — one static secret in env.
- No rate limiting or brute-force protection (note as possible future hardening).
- No change to the NextAuth login flow or the 2-hour session TTL.
- `/public/*`, `/health`, and `/auth/login`/`/auth/logout` stay intentionally open.
- NOT verifying the NextAuth JWT at the backend (the rejected mechanism).
- No audit logging of which admin performed which action.
- The actual production rollout of the new env var coordinates with the in-progress `deploy`
  feature — this feature delivers the code + local config + documents what prod needs.

## Success criteria
- `curl -X POST $BACKEND/pipeline/run` with no header → **401**.
- Same request with `Authorization: Bearer <secret>` → normal result.
- `/public/posts`, `/health`, `/auth/login` still respond with no header.
- A logged-out request to a Next.js `/api/*` mutating route → **401** without ever reaching the backend.
- A logged-in admin can still do everything through the dashboard UI exactly as before.
- pytest covers: protected-without-secret (401), protected-with-secret (expected 2xx), open routes unaffected.

## Dependencies
- A strong `BACKEND_API_SECRET` must be generated and set **identically** on Render (backend reads it)
  and Vercel (frontend forwards it). Coordinates with the `deploy` feature plan.

## Tasks
- [x] Add `BACKEND_API_SECRET` to `.env` and `.env.example`; document the prod requirement (Render + Vercel)
- [x] Add `require_api_key` FastAPI dependency (Bearer-header check, 401 on miss) — `backend/dependencies.py`
- [x] Apply the dependency at router level to `posts`, `pipeline`, `settings`; leave `auth`, `public`, `/health` open
- [x] Backend pytest: protected → 401 w/o secret, 2xx w/ secret; open routes unaffected; existing fixtures no-op the gate, new `test_api_key_auth.py` exercises it
- [x] Add a shared Next.js proxy helper (verify `getToken` session + attach Bearer secret) — `frontend/src/lib/proxy-backend.ts`
- [x] Apply the helper across all `/api/*` routes proxying protected endpoints (posts list/detail/actions, pipeline run/status, settings get/patch)
- [x] Add `BACKEND_API_SECRET` to frontend env handling + `.env.example`
- [x] Update PLANNING.md auth-model note to reflect the new enforced state
- [x] Add a dated PLANNING-decisions.md entry (shared-secret + proxy gate vs JWT verification; trade-offs)

## Verification
- [x] `docker compose run --rm backend pytest` green (103 passed, incl. 7 new auth tests; frontend typecheck/lint/60 tests/build also green)
- [x] Manual curl: unauthenticated POST to a protected endpoint → 401; with the secret → works (open routes 200; wrong key → 401)
- [ ] Manual browser: logged-in admin can publish / trigger / edit settings; logged-out `/api/*` call → 401 (human-only; do after prod env vars are set)
