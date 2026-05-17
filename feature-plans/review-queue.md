---
status: in-progress
started: 2026-05-17
---

# Feature: review-queue

## Goal

Pending-review list + review panel with Accept (publish-now or schedule), Reject, Regenerate with feedback. Builds `GET /posts` (status filter + `total`); wires sidebar QUEUE badge live.

## Scope

- Backend: `GET /posts` with `status` filter and `total` count in response
- Backend: `POST /posts/{id}/accept` with optional `scheduled_at` (publish-now vs schedule)
- Backend: `POST /posts/{id}/reject`
- Backend: `POST /posts/{id}/regenerate` with optional feedback (in-place overwrite, `generation_attempt++`)
- Frontend: `/dashboard/queue` page — pending-review list with Tier 2 cards
- Frontend: Review panel (Tier 1 structural slide-in or full-page) with rendered markdown + sources
- Frontend: Accept flow with publish-now or date/time-picker schedule
- Frontend: Reject + Regenerate (with optional feedback textarea)
- Frontend: sidebar `QUEUE` badge wired to live count

## Out of scope

- `/dashboard/scheduled` and `/dashboard/published` pages (separate `scheduled-and-published` feature)
- `POST /posts/{id}/publish` manual publish action on accepted posts (belongs to scheduled-and-published)
- Real-time / websocket updates to the queue list — refresh on action or page revisit only
- Inline editing of post content before accepting — operator only accepts/rejects/regenerates

## Success criteria

- Accept with no `scheduled_at` → row flips to `published`, `published_at` set to now
- Accept with `scheduled_at` → row flips to `accepted`, `scheduled_at` persisted
- Reject → row flips to `rejected` and disappears from the queue list
- Regenerate → same row, content overwritten, `generation_attempt` incremented; uses optional feedback to re-run `blog-writer`
- Sidebar `QUEUE` badge reflects the live DB count of `status = pending_review` posts

## Dependencies

- `ANTHROPIC_API_KEY` available in root `.env` for the Regenerate path (re-runs `blog-writer` → Claude)
- Date/time picker decision: shadcn `calendar` + a separate time input vs native `datetime-local` — decided as the first frontend task

## Tasks

### Backend
- [ ] Add `GET /posts` with `status` query param + `total` in response
- [ ] Add `POST /posts/{id}/accept` (optional `scheduled_at` body → publish now or schedule)
- [ ] Add `POST /posts/{id}/reject`
- [ ] Add `POST /posts/{id}/regenerate` (optional `feedback`; in-place overwrite; `generation_attempt++`)
- [ ] Pytest coverage for all four endpoints and DB state transitions

### Frontend
- [ ] Decide on date/time picker approach (shadcn calendar + time input vs native `datetime-local`)
- [ ] `/dashboard/queue` page with pending-review cards (Tier 2 per `Design/README.md`)
- [ ] Review panel primitive (Tier 1 slide-in or full-page) with rendered markdown + sources
- [ ] Accept flow — nested modal with `PUBLISH NOW` / `SCHEDULE FOR LATER`
- [ ] Reject action with confirmation
- [ ] Regenerate flow with optional feedback textarea
- [ ] Wire sidebar `QUEUE` badge to live count via `GET /posts?status=pending_review`
- [ ] Vitest tests for queue list + review panel

## Verification

- [ ] Backend `pytest` green — endpoint behavior + DB state transitions covered
- [ ] Manual UI smoke test: set `publishing_mode = approve_only`, trigger pipeline, walk through Accept (both paths), Reject, Regenerate
- [ ] Frontend Vitest green — queue list + review panel component tests
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` all green
