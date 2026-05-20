---
status: done
started: 2026-05-19
completed: 2026-05-20
---

# Feature: public-shell-and-homepage

## Goal

Ship the public sticky nav, footer, and `/` homepage (hero with cover story, tag filter, posts grid) wired to real published posts via `GET /public/posts`, with Month/Issue/No. labels computed from `published_at`.

## Scope

- Public layout shell (`(public)/layout.tsx`) — sticky nav (DELOREAN wordmark + BLOG/ABOUT links) and minimal footer. Body grid + Chakra Petch / JetBrains Mono / Inter fonts wired globally.
- Homepage (`(public)/page.tsx`) — hero with orange radial glow orb, `// COVER STORY` label row, Month/Issue/No. label, two-tone Chakra Petch title, summary, tag pills, `READ STORY →` CTA, author + date. Tag filter pills, `// THE INDEX` section header, full-width post cards with left orange accent bar and client-side tag filtering.
- Backend `GET /public/posts` endpoint — FastAPI router returning only `published` posts ordered by `published_at` DESC. Fields: `id, slug, title, summary, tags, published_at` (+ derived `read_time` if cheap).
- Frontend `getIssueLabel(publishedAt, postsInSameIssue)` helper returning `{ month, year, issue, no }`. Used in hero (and optionally cards).
- Loading skeleton during fetch + `// NO TRANSMISSIONS FOUND` empty state.

## Out of scope

- `/blog/[slug]` post page (next Phase 4 feature `post-page`). Hero CTA can link to `/blog/[slug]`; the page itself stays a stub / 404 for now.
- `/about` page (feature `about-page`). Nav `ABOUT` link is inert.
- Archive views by month / issue (`/archive/...`, `VIEW ARCHIVE →` link). Future work. Link rendered inactive or hidden.
- Per-post SEO meta + Open Graph + structured data + sitemap.xml — belong to `post-page` and a later SEO pass. Homepage gets only basic `<title>` and meta description.

## Success criteria

- `/` renders with the latest published post in the hero, using the correct Month/Issue/No. label (`MAY 2026 · ISSUE 03 · NO. 01` format).
- Tag filter pills narrow the index grid client-side (no page reload).
- `getIssueLabel` matches the rule: `issue = ceil(day_of_month / 7)`; No. = ascending position within the issue ordered by `published_at`.
- `GET /public/posts` returns only `published` posts, ordered by `published_at` DESC. Non-published statuses (`draft`, `pending_review`, `accepted`, `rejected`) excluded.
- Zero-posts state renders the `// NO TRANSMISSIONS FOUND` empty message instead of an empty/broken hero.
- Design tokens applied throughout — no rounded corners, no inline colors, chamfer geometry per `Design/README.md`.

## Tasks

- [x] Backend: add `GET /public/posts` to a new `routers/public.py` (no auth, only `published` status, sorted by `published_at` DESC). Wire into `main.py`.
- [x] Backend: Pydantic response schema with `id, slug, title, summary, tags, published_at` (+ derived `read_time` if cheap).
- [x] Backend: pytest in `tests/test_public_posts.py` — published-only filter, ordering, empty case.
- [x] Frontend: `src/app/(public)/layout.tsx` — sticky nav (DELOREAN wordmark, BLOG/ABOUT links) + minimal footer. ABOUT link inert for now.
- [x] Frontend: verify body grid + Chakra Petch / JetBrains Mono / Inter loaded globally (check existing `globals.css`).
- [x] Frontend: `src/lib/get-issue-label.ts` helper — `getIssueLabel(publishedAt, postsInSameIssue)` returns `{ month, year, issue, no }`.
- [x] Frontend: Vitest in `src/lib/__tests__/get-issue-label.test.ts` — day buckets (1–7→1, 8–14→2, …, 29–31→5), No. sequencing within an issue.
- [x] Frontend: `src/app/(public)/page.tsx` — fetch published posts, compose hero (glow orb, label row, two-tone title, CTA) using the latest post.
- [x] Frontend: `ChamferedPanel` use (or extend if needed) for post cards — 16px TL chamfer, left orange accent bar.
- [x] Frontend: tag filter pills + `// THE INDEX` section header + full-width post cards with client-side tag filtering.
- [x] Frontend: loading skeleton + `// NO TRANSMISSIONS FOUND` empty state.
- [x] Hero CTA `READ STORY →` links to `/blog/[slug]` (target page is a future feature; link can 404 for now).

## Verification

- [ ] `cd frontend && npm run dev` — manual browser walkthrough of `/` against `Design/README.md` (hero, tag filter, cards, grid, glow, fonts).
- [x] `cd frontend && npm run typecheck && npm run lint && npm run build` all clean.
- [x] `cd frontend && npm test` — `get-issue-label` tests pass (22 new, 60 total).
- [x] `docker compose run --rm backend pytest tests/test_public_posts.py` passes (6 new, 87 total).
- [x] At least one published post exists (or trigger the pipeline) to visually verify the hero is populated (8 published posts in DB).
