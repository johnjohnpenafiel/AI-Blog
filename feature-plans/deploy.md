---
status: done
started: 2026-05-26
completed: 2026-05-29
---

# Feature: deploy

## Goal
Ship the full application to production: frontend on Vercel, backend on Render (Starter tier), and Postgres on Neon — reachable at a public URL with admin login and scheduler running.

## Scope
- Neon Postgres provisioning, migration, and admin seed
- Render backend deployment with all env vars set
- Vercel frontend deployment with all env vars set
- Production env config (CORS, NEXT_PUBLIC_API_URL, NEXTAUTH vars)
- Custom domain setup (Vercel frontend + Render backend if applicable)

## Out of scope
- CI/CD auto-deploy on push to main
- Monitoring / alerting (Sentry, uptime monitors)
- Performance tuning (cold-start optimization, CDN layers beyond defaults)

## Success criteria
- Public blog URL serves the homepage and individual post pages
- Admin can log in at `/login` and access all dashboard sections
- APScheduler is confirmed running (Render logs show scheduler boot)
- Manual pipeline run from the dashboard completes successfully
- Custom domain (if configured) resolves to the live site

## Dependencies
- Anthropic + Perplexity API keys available for Render env vars
- Neon account provisioned
- Render account provisioned
- Vercel account provisioned (can be existing)

## Tasks

### Neon (Postgres)
- [x] Create Neon project (free tier, US East region to match Render)
- [x] Copy pooled `DATABASE_URL` connection string
- [x] Run `alembic upgrade head` against Neon
- [x] Run `seed_admin.py` against Neon to create admin user

### Backend prep (code changes before deploy)
- [x] Audit backend for hardcoded `localhost` references
- [x] Confirm CORS `allow_origins` is parameterized via env var (e.g. `FRONTEND_URL`)
- [x] Add `FRONTEND_URL` env var support to backend CORS config

### Render (backend)
- [x] Create Render Starter web service, connect GitHub repo, set start command
- [x] Set all backend env vars on Render (`DATABASE_URL`, `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL`)
- [x] Verify `GET /health` returns 200 on Render URL
- [x] Confirm APScheduler started in Render logs

### Vercel (frontend)
- [x] Audit frontend for hardcoded `localhost` API calls — ensure all use `NEXT_PUBLIC_API_URL`
- [x] Connect GitHub repo to Vercel, set framework root to `frontend/`
- [x] Set frontend env vars (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_URL`)
- [x] Verify public blog loads at Vercel URL
- [x] Verify admin login + dashboard load correctly

### Custom domain — DROPPED (see Notes)
- [ ] ~~Configure custom domain on Vercel (add domain, update DNS records)~~
- [ ] ~~Configure custom domain on Render backend (if applicable)~~
- [ ] ~~Verify domain resolves and HTTPS is active~~

### Smoke test
- [x] Browse public homepage + at least one post page
- [x] Log in as admin, navigate all dashboard sections
- [x] Trigger manual pipeline run from dashboard, confirm it completes without error

## Notes
- 2026-05-29: Custom domain dropped from scope — running on the default `*.vercel.app` / `*.onrender.com` URLs for now. Can be revisited later as a small follow-up.

## Verification
- [x] `GET <prod-url>/health` → 200
- [x] Public homepage loads at production domain
- [x] Admin login succeeds at `/login`
- [x] Manual pipeline run completes (check dashboard status dot goes RUNNING → IDLE)
- [x] Render logs confirm APScheduler cron registered for Mon + Thu 08:00
