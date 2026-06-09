---
status: in-progress
started: 2026-06-09
---

# Feature: featured-story

## Goal
Let the operator pick an "editor's choice" featured post from the dashboard, so the homepage featured (★) band shows a deliberately chosen story instead of always defaulting to the most-recent published post.

## Scope
- `is_featured` boolean column on `posts` (default `false`) + Alembic migration (existing rows backfill to false).
- Admin endpoints:
  - `POST /posts/{id}/feature` — validates `status == published`; clears any existing pin (enforced single); sets `is_featured = true`.
  - `POST /posts/{id}/unfeature` — sets `is_featured = false`.
- Public endpoint `GET /public/posts/featured` — returns the single pinned post **regardless of recency**, and owns the fallback (no pin → most-recent published post). Returns `null`/204-style empty only if there are zero published posts.
- Expose `is_featured` on the admin `PostListItem` schema (drives the dashboard toggle + header readout).
- Public `FeaturedStory` (★) band fetches `/public/posts/featured` instead of taking `posts[0]`.
- Admin **Published** tab:
  - Header readout under the title: `★ FEATURED ON HOMEPAGE — "<title>" [UNFEATURE]` (hidden/dimmed when nothing is pinned and the band is just showing most-recent).
  - Per-row `★ FEATURE` ghost button → accent `★ FEATURED` on the pinned row; clicking another row moves the pin (toast, no confirm).
- Architecture-gate docs updated in the same work: `PLANNING.md` (data model + API contracts) and `PLANNING-decisions.md` (dated entry).

## Out of scope
- **Any image work.** The featured special-image (operator-uploaded override) is deferred to the per-post image-generation feature — already captured on the Trello "Per-post image generation" card. This feature is selection mechanics only.
- The **hero** and the **index list** — both stay newest-first / `posts[0]` / LIVE-on-newest, untouched. The pin drives *only* the featured band for now ("does the pin take over the hero?" is a deliberately deferred decision).
- Multiple simultaneous featured posts (single pin only).
- Featuring non-published posts (queue/scheduled rows get no feature action).
- Scheduling/expiring a feature (a pin stays until the operator changes it).

## Success criteria
- A migration adds `is_featured` and applies cleanly; existing posts read as not-featured.
- `POST /posts/{id}/feature` on a published post pins it and unpins any previously-featured post; a second pin never coexists.
- `POST /posts/{id}/feature` on a non-published post is rejected (4xx).
- `GET /public/posts/featured` returns the pinned post when one exists (even if it's older than the 50 most recent), and the most-recent published post when none is pinned.
- The homepage ★ band renders the pinned post; hero + index are visibly unchanged.
- The Published dashboard shows the current featured post in the header readout and a working FEATURE/FEATURED toggle per row; toggling reflects on the public band.
- Backend tests + frontend typecheck/lint/build pass.

## Dependencies
- None external. (Image override depends on the future image feature, but is out of scope here.)

## Tasks
- [x] Branch `feature/featured-story` off `main`
- [x] Add `is_featured` column to the `Post` SQLAlchemy model
- [x] Alembic migration (add column, default false, backfill existing rows)
- [x] `POST /posts/{id}/feature` + `POST /posts/{id}/unfeature` in `routers/posts.py` (publisher/service helper for the clear-others logic)
- [x] `GET /public/posts/featured` in `routers/public.py` (pinned-or-most-recent fallback)
- [x] Expose `is_featured` on admin `PostListItem`; ensure public featured response shape carries what the band needs
- [x] Frontend: `FeaturedStory` band fetches `/public/posts/featured`; add proxy/lib call
- [x] Frontend admin Published: header readout + per-row FEATURE/FEATURED toggle + lib calls + toast
- [x] Update `PLANNING.md` (data model + API contracts) and `PLANNING-decisions.md` (dated entry)

## Verification
- [x] `docker compose run --rm backend pytest` (new tests for feature/unfeature/single-pin/published-only + featured endpoint fallback)
- [x] `cd frontend && npm run typecheck`
- [x] `cd frontend && npm run lint`
- [x] `cd frontend && npm run build`
- [x] Manual: pin an older post, confirm it shows in the ★ band while hero/index stay newest-first; unpin, confirm fallback
- [x] Open PR for review (do NOT merge to main)
