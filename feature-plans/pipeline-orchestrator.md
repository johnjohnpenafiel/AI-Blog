---
status: in-progress
started: 2026-05-15
---

# Feature: pipeline-orchestrator

## Goal
Wire `news_fetcher` → `blog_writer` → routing into one orchestrator and expose `POST /pipeline/run` + `GET /pipeline/status`, so a manual trigger produces a `posts` row at the correct status end-to-end.

## Scope
- New `backend/services/publisher.py` — sets `status=published` + `published_at=now()` for `auto` mode, or `status=pending_review` for `approve_only`. Snapshots the current global `publishing_mode` onto the new post row.
- New `backend/services/pipeline.py` — orchestrator that calls `news_fetcher.fetch_qualifying_articles()`, then `blog_writer.generate_post(articles)`, persists the `Post` + `Source` rows, and routes via `publisher.py`. Updates `settings.last_run_at` on every run (including skips).
- New `backend/routers/pipeline.py` — `POST /pipeline/run` (returns the created post or a structured skip response) and `GET /pipeline/status` (returns `last_run_at`, `next_run_at`, and current `idle`/`running` state from in-process state).
- Wire the new router into `backend/main.py`.
- Default `Settings` row bootstrapping — confirm/seed a single settings row so `/pipeline/status` has something to read.

## Out of scope
- **Auth on `/pipeline` endpoints.** Backend has no auth dependency yet; deferring to a pre-deploy auth-guard pass. **Hard prerequisite for the Phase 5 `deploy` feature** — must not ship to production until a `require_admin` dep guards `/pipeline/run` (and ideally all admin endpoints).
- APScheduler cron — owned by the next feature, `scheduler-cron`. `next_run_at` will be `null` until that lands; acceptable.
- Retry / backoff on Claude or Perplexity failures — owned by Phase 5 `pipeline-resilience`. Fail loud, log, return error here.
- Concurrency guard against overlapping `POST /pipeline/run` calls — single admin, low risk.

## Success criteria
- `POST /pipeline/run` with global `publishing_mode=auto` creates a `posts` row with `status=published`, `published_at` set, and `publishing_mode=auto` snapshotted on the row.
- Same call with `publishing_mode=approve_only` creates a `posts` row with `status=pending_review`, `published_at=null`, `publishing_mode=approve_only`.
- Skip path: when `news_fetcher` returns <3 qualifying articles, no `posts` row is created, the run is structured-logged, and the endpoint returns a clear skip response (e.g. `{"skipped": true, "reason": "...", "article_count": n}`).
- For successful runs, every source article used in generation becomes a `sources` row with FK to the new post (title, url, publisher, published_date).
- `GET /pipeline/status` returns `last_run_at`, `next_run_at` (null for now), and current state (`idle` or `running`).

## Dependencies
- A single `settings` row must exist (or be created on first read) for `/pipeline/status` and for snapshotting `publishing_mode`. Verify via migration or add a bootstrap step.

## Tasks
- [x] Verify/seed default `settings` row (migration data step or runtime get-or-create) — already seeded by `9bf3ca7af67f_initial_schema.py:111-116`
- [x] Create `backend/services/publisher.py` with `route_post(post, mode)` that sets status + published_at per mode
- [x] Create `backend/services/pipeline.py` with `run_pipeline(db)` that: reads settings → fetches articles → handles skip → generates post → persists `Post` + `Source` rows → routes via publisher → updates `settings.last_run_at`
- [x] Add Pydantic response schemas for `/pipeline/run` (success + skip) and `/pipeline/status`
- [x] Create `backend/routers/pipeline.py` with `POST /pipeline/run` and `GET /pipeline/status`; track `idle`/`running` state in a module-level flag
- [x] Wire router into `backend/main.py`
- [x] Unit tests in `backend/tests/test_pipeline.py`: auto happy path, approve_only happy path, skip path, sources persisted, publishing_mode snapshot correct — all with mocked `news_fetcher` + `blog_writer`
- [x] Tests for `/pipeline/status` response shape

## Verification
- [x] `docker compose run --rm backend pytest tests/test_pipeline.py` passes (8/8)
- [x] Full `pytest` suite still green (29/29)
- [x] Manual: `curl -X POST http://localhost:8000/pipeline/run` against the running stack produces a real post; `psql` shows the row + sources (verified both modes: approve_only → pending_review, auto → published with `published_at` set)
- [x] Manual: `curl http://localhost:8000/pipeline/status` returns expected shape with `last_run_at` updated
- [ ] CI green on the PR
