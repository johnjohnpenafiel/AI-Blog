---
status: done
started: 2026-06-03
completed: 2026-06-03
---

# taxonomy-data-model

## Goal
Posts carry real categorization — `section`, `format`, `story_type` (single values) + `tags[]` (many) — backed by a canonical vocabulary kept in code (plain text, app-validated, **not** DB enums, so categories graduate without a migration).

## Scope
- New `backend/taxonomy.py` module: the canonical vocabulary (sections + nested tags, formats, story-types) as plain Python lists/dicts — one source of truth — plus validation helpers.
- Three new nullable columns on `posts`: `section`, `format`, `story_type` (TEXT). `tags` (array) stays.
- App-level validation: the model rejects an out-of-vocabulary `section` / `format` / `story_type` on assignment (`@validates`); a Pydantic schema mirrors it for the write path.
- Forward-only Alembic migration: add the three columns + backfill existing rows (map legacy tag → section with a default fallback; relocate the legacy `Industry Move` tag out of `tags` into `story_type`; default `format` to `Deep Dive` for existing posts).
- Expose the three fields (read-only) on `PostOut` + `PostListItem` so responses carry them.
- Tests covering the vocabulary, the validation rejection, and the model accepting all four labels.

## Out of scope
- **Populating section/format/story_type from the pipeline** — the generator choosing these is Phase 2 (`multi-format-generation`). Phase 1 only adds the capability; new posts may leave them null until Phase 2.
- **Migrating the `tags` vocabulary** (legacy 7 tags → the new nested fine tags) — strict tag validation would break the untouched pipeline, so tags stay free-form here; the tag-validation helper exists for Phase 2 to adopt.
- **Browse/filter UI or query params by section** — that's Phase 3 (`review-queue` / dashboard) territory.
- **Promoting story_type to a navigation index** — stored now, surfaced later.
- **News sourcing / scheduler / generation changes** — later features.

## Success criteria
- A `Post` can be created and saved with all four labels (`section`, `format`, `story_type`, `tags`).
- Assigning an invalid `section` / `format` / `story_type` raises a `ValueError` (app rejects it).
- `alembic upgrade head` applies cleanly on top of `7e4a9f2b1c83`.
- After migration, existing posts have a non-null `section`; any `Industry Move` tag is moved into `story_type` and removed from `tags`.
- Adding a new category is a one-line edit in `backend/taxonomy.py` (no migration).

## Tasks
- [x] Write `backend/taxonomy.py` — `SECTION_TAGS` dict (sections → nested tags), derived `SECTIONS` / `TAGS` lists, `FORMATS`, `STORY_TYPES`, and `is_valid_section/format/story_type` + `is_valid_tag` helpers.
- [x] Add `section` / `format` / `story_type` nullable columns to `models/post.py` with `@validates` guards rejecting out-of-vocab values.
- [x] Add the three fields to `PostOut` and `PostListItem` in `schemas/posts.py`, plus a `PostTaxonomyIn` schema that validates them for the write path.
- [x] Write the Alembic migration (add columns + backfill: section map w/ default, format default, Industry Move → story_type relocation).
- [x] Write `backend/tests/test_taxonomy.py` — vocab integrity, helper validation, model `@validates` rejection, model accepts all four labels, backfill SQL semantics.
- [x] Apply the migration and run the full backend test suite green.

## Verification
- [x] `docker compose run --rm backend alembic upgrade head` applies with no error (`7e4a9f2b1c83 -> c4f1a2b3d6e7`; `alembic current` = `c4f1a2b3d6e7 (head)`).
- [x] `docker compose run --rm backend pytest` passes — **123 passed** (103 prior + 20 new, no regressions).
- [x] A test proves `Post(section="Nonsense")` raises `ValueError` and a Post with all four labels saves (`test_taxonomy.py`).
- [x] `grep` confirms `section`, `format`, `story_type` present in the new migration's `upgrade()`.
