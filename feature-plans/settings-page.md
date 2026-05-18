---
status: in-progress
started: 2026-05-18
---

# Feature: settings-page

## Goal
Deliver a fully functional `/dashboard/settings` page where the admin can toggle publishing mode (Auto / Approve Only), view the fixed pipeline schedule, trigger a manual pipeline run, and log out — backed by GET /settings and PATCH /settings endpoints.

## Scope
- Publishing mode segmented control (Auto / Approve Only) — persisted via PATCH /settings
- Schedule read-only display ("MON + THU AT 8:00 AM" — hardcoded, not editable)
- Manual pipeline trigger button (⚡ TRIGGER MANUAL RUN → POST /pipeline/run)
- Session section — current admin email + LOGOUT button (NextAuth signOut)
- GET /settings and PATCH /settings backend endpoints
- Design system applied: chamfer geometry, Tier 2 components, JetBrains Mono chrome

## Out of scope
- Schedule editing or changing cadence (Mon + Thu at 8 AM is hardcoded)
- Password / credential management (script-only operation)
- Email digest or notification settings
- Multi-user / role management

## Success criteria
- PATCH /settings persists publishing mode to DB and is reflected on next GET /settings
- Manual trigger button fires POST /pipeline/run
- Logout ends NextAuth session and redirects to /login
- GET /settings and PATCH /settings endpoints exist with at least one happy-path pytest test each

## Tasks
- [x] Build GET /settings endpoint (returns publishing_mode, schedule_frequency, last_run_at, next_run_at)
- [x] Build PATCH /settings endpoint (updates publishing_mode, returns updated settings)
- [x] Write pytest tests for GET /settings and PATCH /settings (happy-path)
- [x] Build frontend /dashboard/settings page shell (slots into dashboard layout)
- [x] Publishing mode segmented control (Auto / Approve Only) — calls PATCH /settings on change
- [x] Schedule read-only display — hardcoded "MON + THU AT 8:00 AM"
- [x] Manual trigger button (⚡ TRIGGER MANUAL RUN) — calls POST /pipeline/run
- [x] Session section — display admin email + LOGOUT button (NextAuth signOut)
- [x] Apply design system: chamfer geometry, Tier 2 component styling, JetBrains Mono labels
- [x] Frontend typecheck + lint pass

## Verification
- [ ] Manual browser walkthrough: toggle publishing mode, trigger pipeline run, logout
- [x] Backend pytest tests for GET /settings and PATCH /settings pass
- [x] npm run typecheck and npm run lint both exit 0
- [ ] CI passes on PR
