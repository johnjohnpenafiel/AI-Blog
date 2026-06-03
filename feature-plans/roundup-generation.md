---
status: done
started: 2026-06-03
completed: 2026-06-03
---

# roundup-generation

## Goal
The Friday **Roundup** — a week-in-review that summarizes the week's *own* published posts (not fresh news), plus the scheduler's Friday slot. Closes Phase 2's content engine.

## Scope
- `blog_writer.generate_roundup(posts)` — Claude produces a Roundup (week-range header → through-line → "The Big Story" → "Also This Week" → "Worth Watching") from the week's published posts; sources are derived from those posts (links to `/blog/{slug}`). New `RoundupDraft` schema (GeneratedPost minus sources).
- `pipeline.run_roundup(db)` — gather posts published in the last 7 days (status published, not themselves Roundups); skip if none; generate; persist as `format="Roundup"`, `section=None`; route by publishing mode.
- Scheduler: add **Friday** to the cron (`mon,thu,fri`), `WEEKDAY_FORMATS[Fri]="Roundup"`, and `compute_next_run_at`/`_FIRE_WEEKDAYS` now include Friday. The cron job branches: Roundup → `run_roundup`, else → `run_pipeline`.

## Out of scope
- News sourcing / Brief / Deep Dive — prior features.
- Tag-vocabulary change; Explainer/Timeline/Rankings formats.
- Any change to how Briefs/Deep Dives are generated.

## Success criteria
- `run_roundup` with ≥1 eligible post creates a `format="Roundup"` post whose sources link the week's posts; with 0 eligible posts it skips cleanly.
- The Friday cron fires `run_roundup`; Mon/Thu unchanged.
- `compute_next_run_at` returns Fri 08:00 when appropriate (e.g. Thu 08:00 → Fri 08:00).
- Full backend suite green (scheduler trigger/job tests updated for the Mon/Thu/Fri cadence).

## Tasks
- [x] `schemas/blog_writer.py` — `RoundupDraft` (title/slug/summary/meta_description/body/tags).
- [x] `blog_writer.py` — `generate_roundup(posts) -> GeneratedPost` (roundup prompt + tool; POV; derive sources from posts).
- [x] `pipeline.py` — `run_roundup(db)` (gather week's posts, skip-if-empty, persist Roundup, route).
- [x] `scheduler.py` — Friday in cron + `_FIRE_WEEKDAYS` + `WEEKDAY_FORMATS`; job branches Roundup → `run_roundup`.
- [x] Tests: `test_roundup.py` (generate_roundup shape + run_roundup persist/skip/exclude-roundups); updated `test_scheduler_trigger.py` + `test_scheduler_job.py` for Mon/Thu/Fri.
- [x] Full backend suite green.

## Verification
- [x] `docker compose run --rm backend pytest` passes — **149 passed**.
- [x] `test_run_roundup_creates_roundup_post` builds a `format="Roundup"` post linking the week's posts.
- [x] `test_run_roundup_skips_when_no_recent_posts` skips when nothing in the window.
- [x] `test_compute_next_run_at` includes Thu 08:00 → Fri 08:00.
- [x] `test_weekday_format_mapping` asserts Friday → Roundup.

## Notes
- Roundup excludes prior roundups from its window (`is_distinct_from("Roundup")`). Roundup sources are internal `/blog/{slug}` links (publisher "The Garage AI"). Lookback window = 7 days (`ROUNDUP_LOOKBACK_DAYS`).
