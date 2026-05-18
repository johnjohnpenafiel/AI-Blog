---
status: in-progress
started: 2026-05-17
---

# Feature: scheduled-publisher

## Goal
Add an in-process APScheduler interval job (every 1 minute) that scans for accepted posts whose `scheduled_at` has passed and flips them to `published`, so "schedule for later" actually publishes when the time arrives.

## Scope
- New APScheduler interval job registered alongside the existing Mon/Thu cron in `backend/scheduler.py`, running every 1 minute.
- `publish_due_posts()` service function — atomic `UPDATE...WHERE status='accepted' AND scheduled_at <= now()` in a single statement, so a concurrent manual Publish Now can't race it. Sets `status='published'`, `published_at=now()`, clears `scheduled_at`.
- Quiet logging — INFO log per post published; nothing on empty scans. Errors at WARNING.
- Update PLANNING.md (new scheduler job in the components section, new entry in scheduler-cron's behavior) and PLANNING-decisions.md (1-min cadence rationale, atomic-UPDATE race-safety rationale).

## Out of scope
- Retry-on-failure machinery, per-post error columns, or backoff. If the UPDATE fails, the next tick (60s later) retries naturally.
- Multi-worker scheduler leader election. Single backend instance assumption matches the existing Mon/Thu cron.
- Surfacing publish errors in the admin UI. Server logs only.
- Editing `scheduled_at` from anywhere new. Worker only reads it.

## Success criteria
- After `start_scheduler()` runs, both `pipeline-cron` and `scheduled-publisher` jobs are registered (visible in boot logs).
- A scheduled post auto-publishes within ~60s of `scheduled_at` (manual end-to-end check).
- Concurrent Publish-Now + worker scan can't double-publish — covered by a unit test simulating the race.
- No log spam on empty scans (zero INFO lines from the worker when nothing is due).

## Dependencies
None. APScheduler is already running for Mon/Thu; just add a second job. No new packages, no schema changes, no env vars.

## Tasks
- [x] Backend: add `publish_due_posts()` to `backend/services/publisher.py` (or a new file if `publisher.py` doesn't exist) — atomic UPDATE with status guard; returns count of posts published
- [x] Backend: register a new `scheduled-publisher` interval job in `backend/scheduler.py` (every 1 min, UTC, with sensible `misfire_grace_time`)
- [x] Backend: tests for `publish_due_posts()` — no-op, one due, accepted-but-not-yet-due, already-published, race simulation
- [x] Backend: test that `start_scheduler()` registers both jobs
- [x] Update `PLANNING.md` to reflect the new scheduler job
- [x] Add dated entry to `PLANNING-decisions.md` covering the 1-min cadence + atomic-UPDATE race safety

## Verification
- [x] Backend unit tests for `publish_due_posts()` pass (including race simulation)
- [x] Scheduler-boot test asserts both jobs registered
- [x] Manual: schedule a post 2 minutes out via the dashboard, watch it auto-publish (verify on `/dashboard/published`)
- [ ] Tail logs for ~5 minutes with no due posts, expect zero worker log lines (pre-existing logging config doesn't surface INFO through `docker compose logs` — verify after deploy with Render's log stream)
- [ ] After Render deploy: repeat the 2-minute manual check in production
