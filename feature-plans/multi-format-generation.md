---
status: done
started: 2026-06-03
completed: 2026-06-03
---

# multi-format-generation

## Goal
Produce the right *kind* of post, in our voice, on the right day — **Brief** (Mon) and **Deep Dive** (Thu) — with the operator-first / proof-over-hype POV baked into the prompt, and the scheduler tying each run to a format (user-approved scheduler change).

## Scope
- `blog_writer.generate_post(articles, *, format, feedback)` — format-aware: a `FORMAT_SPECS` map (length + structure skeleton per format), and the **POV** block replacing the old tone line.
- `run_pipeline(db, *, format)` + `persist_generated_post(..., format)` set `post.format`.
- Scheduler: the Mon/Thu cron job derives its format by weekday (`WEEKDAY_FORMATS = {Mon: Brief, Thu: Deep Dive}`). Cron still fires Mon + Thu (Friday/Roundup is feature 3).
- Manual `POST /pipeline/run` accepts an optional `format` (default `Deep Dive`), validated to a generatable format.

## Out of scope
- **Friday + Roundup** — feature 3 (`roundup-generation`) adds the Friday slot and `compute_next_run_at` change.
- **Tag-vocabulary change** — blog-writer keeps emitting the legacy tag set; populating the new nested tags is deferred.
- **News sourcing** — done in `news-sourcing-v2`.
- **Explainer/Timeline/Rankings formats** — not in the first build.

## Success criteria
- `generate_post(articles, format="Brief")` and `format="Deep Dive"` send format-specific length + structure instructions and the POV block in the prompt.
- An unsupported format raises `BlogWriterError`.
- A scheduled Monday run generates a Brief; a Thursday run a Deep Dive (`post.format` set accordingly).
- Manual trigger defaults to Deep Dive and accepts a `format` override.
- Full backend suite green.

## Tasks
- [x] `blog_writer.py` — add `FORMAT_SPECS`, the POV block, a `format` param; rebuild the prompt template; guard unsupported formats.
- [x] `pipeline.py` — thread `format` through `run_pipeline` + `persist_generated_post`; set `post.format`.
- [x] `scheduler.py` — `WEEKDAY_FORMATS` map; job derives format by weekday and passes it to `run_pipeline`.
- [x] `schemas/pipeline.py` + `routers/pipeline.py` — optional `format` on manual trigger (default Deep Dive, validated).
- [x] Tests: format-specific prompt + POV + unsupported-format (test_blog_writer); `post.format` set + manual override + invalid-422 (test_pipeline); weekday→format + job-passes-format (test_scheduler_job).
- [x] Full backend suite green.

## Verification
- [x] `docker compose run --rm backend pytest` passes — **140 passed** (132 prior + 8 new).
- [x] Tests assert the Brief prompt carries Brief length/structure and the Deep Dive prompt the Deep Dive ones.
- [x] A test asserts the POV ("operator", "vendor hype") text is in the prompt.
- [x] A test asserts `generate_post(format="Tweet")` raises.
- [x] A test asserts Monday→Brief, Thursday→Deep Dive (`test_weekday_format_mapping`).

## Notes
- Cron still fires Mon + Thu only; Friday→Roundup + `compute_next_run_at` change land in `roundup-generation` (feature 3), as scoped.
- Blog-writer still emits the legacy tag set (tag-vocabulary update deferred).
