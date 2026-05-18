---
status: in-progress
started: 2026-05-17
---

# Feature: scheduled-and-published

## Goal
Build `/dashboard/scheduled` (edit-schedule, publish-now, back-to-queue) and `/dashboard/published` (read-only with view-post link), reusing `GET /posts` and the review-queue patterns.

## Scope
- `/dashboard/scheduled`: list of accepted posts with `scheduled_at`, sorted by `scheduled_at`. Per-row actions: Edit Schedule, Publish Now, Back to Queue.
- `/dashboard/published`: read-only list of published posts with View Post button per row (opens `/blog/[slug]` in new tab). Paginated/load-more for the long tail.
- Three new backend endpoints (purpose-built, mirroring the existing `/accept` `/reject` `/regenerate` style):
  - `POST /posts/{id}/reschedule` — body `{ scheduled_at }`, only valid on `status=accepted`.
  - `POST /posts/{id}/unschedule` — clears `scheduled_at` and flips status back to `pending_review`, only valid on `status=accepted`.
  - `POST /posts/{id}/publish` — flips `accepted` → `published`, sets `published_at`, clears `scheduled_at`.
- Sidebar QUEUE badge updates correctly after Back-to-Queue.

## Out of scope
- Editing post body/title/tags from these pages.
- Bulk actions (multi-select publish / back-to-queue).
- Sort or filter controls on the published list (reverse-chronological only).
- Unpublishing or deleting published posts (kept open for a future feature, not addressed here).

## Success criteria
- `/dashboard/scheduled` lists accepted posts sorted by `scheduled_at` with an empty state when none exist.
- All three row actions hit the backend and update the DB (`Edit Schedule` → `/reschedule`, `Publish Now` → `/publish`, `Back to Queue` → `/unschedule`).
- `/dashboard/published` lists published posts and each row opens `/blog/[slug]` in a new tab; pagination/load-more works past the first page.
- Sidebar QUEUE badge increments after Back-to-Queue and is unaffected by Publish Now.

## Dependencies
- None blocking. The `/blog/[slug]` route is Phase 4 and not yet built, so the View Post link will 404 in dev until that lands — acceptable, will be verified end-to-end after Phase 4.

## Tasks
- [x] Backend: add `POST /posts/{id}/reschedule` with status guard + Pydantic body schema
- [x] Backend: add `POST /posts/{id}/unschedule` with status guard
- [x] Backend: pytest coverage for both endpoints (happy paths + status guards)
- [x] Frontend: `/dashboard/scheduled` page — list view with Tier-2 cards, reverse-chronological by `scheduled_at`, empty state
- [x] Frontend: Edit Schedule action — inline date/time picker that calls `/reschedule`
- [x] Frontend: Publish Now action with confirm — calls existing `/publish`
- [x] Frontend: Back to Queue action with confirm — calls `/unschedule`
- [x] Frontend: `/dashboard/published` page — read-only Tier-2 rows with View Post button opening `/blog/[slug]`
- [x] Frontend: pagination/load-more on published list
- [x] Frontend: confirm sidebar QUEUE badge wiring still reflects DB after Back-to-Queue
- [x] Vitest component tests for both pages (row actions + empty states)

## Verification
- [x] Backend tests for `/reschedule`, `/unschedule`, `/publish` pass (24/24 in test_posts.py; 67/67 in full backend suite)
- [x] Vitest tests for the new pages pass (36/36 in full frontend suite)
- [x] Frontend typecheck + lint pass
- [ ] Manual click-through: accept a post with schedule → edit it → back to queue → re-accept → publish now
- [ ] QUEUE badge in sidebar updates after Back-to-Queue (visible across both pages)
