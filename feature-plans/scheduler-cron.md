---
status: in-progress
started: 2026-05-15
---

# Feature: scheduler-cron

## Goal
Wire APScheduler into the FastAPI process so the pipeline fires automatically every Monday and Thursday at 8:00 AM UTC, and so each run updates the `settings.last_run_at` / `next_run_at` columns the admin dashboard will read.

## Scope
- APScheduler initialized in the FastAPI lifespan (startup + clean shutdown).
- Two cron triggers — Monday 8:00 AM UTC and Thursday 8:00 AM UTC — both calling the existing pipeline runner from the `pipeline-orchestrator` feature.
- On each scheduled fire: update `settings.last_run_at` and recompute `settings.next_run_at`. Also write `next_run_at` on boot so a fresh DB shows a sensible value.
- Unit tests covering the cron trigger (time-mocked) and the settings persistence.

## Out of scope
- Exposing schedule cadence in the Settings UI — Mon+Thu 8 AM stays hardcoded per PLANNING.md.
- Multi-worker scheduler coordination (leader election, distributed locks). Single-process only at MVP scale.
- Retry / backoff on pipeline failure — that's the `pipeline-resilience` feature in Phase 5. Failures here are logged and skipped.
- Persistent job store (no `SQLAlchemyJobStore`). Jobs live in memory; the schedule re-registers on every boot. Timezone is also hardcoded — no per-deploy TZ config.

## Success criteria
- Backend boots with the scheduler running; logs show both jobs registered with their next fire time.
- A time-mocked unit test confirms the trigger fires on Mon and Thu at 8:00 AM UTC and not on other days/times.
- After a fired run, `settings.last_run_at` reflects the fire time and `settings.next_run_at` advances to the next Mon-or-Thu 8 AM UTC.
- Hitting `POST /pipeline/run` manually still works and does not double-fire from the scheduler.

## Dependencies
- `APScheduler` added to `backend/requirements.txt` (and rebuilt in the Docker image).
- Existing pipeline runner from the `pipeline-orchestrator` feature (already merged).
- Existing `settings` table with `last_run_at` / `next_run_at` columns (already migrated).

## Tasks
- [x] Add `APScheduler` to `backend/requirements.txt` and rebuild the backend image.
- [x] Create `backend/scheduler.py` with an `AsyncIOScheduler` instance and `start_scheduler()` / `shutdown_scheduler()` helpers.
- [x] Register a single `CronTrigger` covering `day_of_week='mon,thu', hour=8, minute=0, timezone='UTC'` that calls the pipeline runner. (One trigger with both days is equivalent to two triggers and avoids duplicate job IDs.)
- [x] Wire `start_scheduler()` / `shutdown_scheduler()` into the FastAPI `lifespan` context in `backend/main.py`.
- [x] `compute_next_run_at(now)` in `scheduler.py` computes the next Mon/Thu 8 AM UTC; the scheduled job calls it after `run_pipeline` returns and writes `settings.next_run_at`. (`last_run_at` is already written inside `run_pipeline`, so the scheduler doesn't duplicate that.)
- [x] On scheduler startup, compute and persist `next_run_at` so a fresh DB has a value before the first fire.
- [x] Add structured logging: jobs registered, fire start/end, settings updated, failures. (Module logger; visibility through uvicorn matches the existing `services/pipeline.py` pattern.)
- [x] Confirm `POST /pipeline/run` still works and does not race with a scheduled fire. (Full test suite green; both paths use separate sessions on the same Postgres row.)

## Verification
- [x] Unit test: trigger fires on Mon 8 AM and Thu 8 AM UTC; does not fire on other days/times. (`tests/test_scheduler_trigger.py`)
- [x] Unit test: after a fire, `settings.next_run_at` is updated to the next Mon-or-Thu 8 AM UTC; on failure it stays unchanged. (`tests/test_scheduler_job.py`)
- [x] Boot the backend and confirm the scheduler started (`settings.next_run_at` populated on first boot).
- [x] Inspect the `settings` row in Postgres: `last_run_at` / `next_run_at` are both timezone-aware and `next_run_at = 2026-05-18 08:00:00+00` (next Mon from today 2026-05-15).
- [ ] Integration check: temporarily swap the cron for a short interval and observe a real end-to-end fire. *(Skipped — would consume Perplexity + Anthropic API credits; covered by unit tests against the trigger and the job function in isolation.)*
