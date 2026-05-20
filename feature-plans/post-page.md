---
status: done
started: 2026-05-20
completed: 2026-05-20
---

# post-page

## Goal
Ship `/blog/[slug]` — the individual post page with a Chakra Petch header, rendered markdown body, share bar (X / LinkedIn / Copy Link), collapsible sources list, and per-post OG meta tags.

## Scope
- Backend: `PublicPostSource` + `PublicPostDetail` schemas in `schemas/public.py`
- Backend: `GET /public/posts/{slug}` endpoint in `routers/public.py` (selectinload sources)
- Frontend: `getPublicPost(slug)` in `lib/public-api.ts`
- Frontend: `components/public/post-body.tsx` — react-markdown + remark-gfm, design-token typography
- Frontend: `components/public/share-bar.tsx` — X / LinkedIn / Copy Link, dual-chamfer outline, copy confirmation
- Frontend: `components/public/sources-list.tsx` — collapsible sources section
- Frontend: `app/(public)/blog/[slug]/page.tsx` — server component with `generateMetadata` for title + OG tags

## Out of scope
- About page (next feature: `about-page`)
- Related posts / next-post navigation
- Admin post editing
- 404 page redesign (Next.js default 404 is fine for MVP)
- Comments / reactions
- Read-time tracking or analytics

## Success criteria
- Any published post slug resolves to `/blog/[slug]` and renders title, markdown body, share bar, and sources
- X and LinkedIn share buttons open the correct pre-populated share URLs
- Copy Link shows brief `COPIED ✓` confirmation then resets
- OG tags (`og:title`, `og:description`, `og:type`, `og:url`) visible in page source
- `npm run typecheck`, `npm run lint`, `npm test`, and `pytest` all pass

## Tasks
- [x] Add `PublicPostSource` + `PublicPostDetail` schemas to `backend/schemas/public.py`
- [x] Add `GET /public/posts/{slug}` to `backend/routers/public.py` with source eager-load
- [x] Add `getPublicPost(slug)` to `frontend/src/lib/public-api.ts`
- [x] Create `frontend/src/components/public/post-body.tsx` (react-markdown rendering)
- [x] Create `frontend/src/components/public/share-bar.tsx` (X / LinkedIn / Copy)
- [x] Create `frontend/src/components/public/sources-list.tsx` (collapsible)
- [x] Create `frontend/src/app/(public)/blog/[slug]/page.tsx` with `generateMetadata`

## Verification
- [x] `cd frontend && npm run typecheck` — no errors
- [x] `cd frontend && npm run lint` — no errors
- [x] `cd frontend && npm test` — passes
- [x] `docker compose run --rm backend pytest` — passes
- [ ] (human) Visit `/blog/[slug]` for a published post — confirm title, markdown body, share bar, sources render correctly
- [ ] (human) Click X / LinkedIn — confirm share URLs open; click Copy Link — confirm `COPIED ✓` appears
- [ ] (human) View page source — confirm `og:title`, `og:description`, `og:url` tags present
