---
status: in-progress
started: 2026-05-17
---

# Feature: dashboard-shell

## Goal
Ship the persistent admin sidebar + Tier 1 main shell layout, the design-system v2.0 foundations (orange tokens, Chakra Petch, body grid, `ChamferedPanel` primitive), an auth gate on `/dashboard*`, and placeholder pages for every dashboard route — so every later Phase 3 feature has a stable shell to hang off.

The `/dashboard` overview page itself is **not in this feature** — it lands last in Phase 3 (`dashboard-overview`) after the endpoints it consumes (`GET /posts`, `GET /settings`) have been built by intermediate features. See `PLANNING-decisions.md` entry dated 2026-05-17.

## Scope
- Design-system v2.0 token overhaul in `frontend/src/app/globals.css` (orange `#ff6a00` accent, full token set per `Design/README.md`, body grid CSS variables).
- Load **Chakra Petch** font in `frontend/src/app/layout.tsx` alongside Inter + JetBrains Mono.
- Body grid overlay (orange @ 6%, 48px cells) applied to `<body>`.
- `<ChamferedPanel>` primitive — clip-path + SVG border overlay, supports `tier="structural|component"` and `size="sidebar|shell|card|button|tag"` with single/dual/quad cut patterns.
- Tier 1 persistent left sidebar: DELOREAN/ADMIN wordmark, nav links (Overview / Queue / Scheduled / Published / Settings), active-state styling, bottom pipeline-status dot + Logout. **QUEUE badge slot ships with hardcoded `0`** — wired live in `review-queue` feature.
- Tier 1 main content shell (`frontend/src/app/dashboard/layout.tsx`) wrapping every `/dashboard/*` route (recessed `#000` panel, 20px dual chamfer, orange perimeter @ 40%).
- `frontend/src/proxy.ts` — Next.js 16 proxy (formerly middleware) using `next-auth/middleware` `withAuth` to protect `/dashboard/:path*`.
- Pipeline status dot: client component polling `GET /pipeline/status` (already exists in backend), renders ● IDLE / ● RUNNING with orange glow when running.
- Placeholder pages for `/dashboard` (overview), `/dashboard/queue`, `/dashboard/scheduled`, `/dashboard/published`, `/dashboard/settings` so sidebar links resolve.
- Responsive: sidebar collapses below a sensible breakpoint.

## Out of scope
- The 4 stat cards on `/dashboard` — moved to `dashboard-overview` feature.
- Trigger Pipeline / Go To Queue buttons — moved to `dashboard-overview` and `settings-page`.
- `GET /posts`, `GET /settings`, `PATCH /settings` — built by `review-queue` and `settings-page`.
- Real content for queue / scheduled / published / settings pages — placeholders only.
- Wiring the QUEUE pending-count badge to real data — done in `review-queue`.

## Success criteria
- Hitting `/dashboard` while logged out redirects to `/login`.
- Logged-in user lands on `/dashboard`; sidebar renders persistently on every `/dashboard/*` route; active link reflects current route.
- Bottom-of-sidebar status dot reads `● IDLE` or `● RUNNING` from `GET /pipeline/status`; running state has orange glow.
- Tier 1 sidebar + main shell render with correct chamfers (20px dual, true 45°), `--accent-structural` perimeter @ 40%, and chamfer cut lines as real diagonal cuts (not painted lines on hidden corners).
- Body shows faint orange grid (6%, 48px) running continuously.
- Design tokens in `globals.css` match `Design/README.md` v2.0 (orange `#ff6a00`, full set).
- `npm run typecheck` and `npm run lint` pass; Vitest tests for `Sidebar` and `ChamferedPanel` pass.
- Login page still renders correctly with the new orange accent (visual sanity check — no regression).

## Dependencies
- `GET /pipeline/status` already exists at `backend/routers/pipeline.py:62` — used for the status dot.
- NextAuth config at `frontend/src/lib/auth.ts` — imported by `proxy.ts`.

## Open follow-up (flagged, not fixed here)
- `GET /pipeline/status` is currently unauthenticated (`Depends(get_db)` only). Frontend is calling it from a client component, which works, but pipeline endpoints should require admin auth. Out of scope for this UI feature — capture as `bugfix/auth-pipeline-endpoints`.

## Tasks
- [ ] Update `frontend/src/app/globals.css` — overhaul tokens to v2.0 palette + body grid CSS vars.
- [ ] Load Chakra Petch in `frontend/src/app/layout.tsx`; apply body grid background.
- [ ] Create `frontend/src/proxy.ts` using `next-auth/middleware` `withAuth`, matcher `/dashboard/:path*`.
- [ ] Build `frontend/src/components/chamfered-panel.tsx` primitive (clip-path + SVG overlay per `Design/README.md` "Chamfer implementation").
- [ ] Build `frontend/src/lib/api.ts` minimal fetch wrapper + `getPipelineStatus()` typed against backend response.
- [ ] Build `frontend/src/components/dashboard/pipeline-status-dot.tsx` — client component, polls every 5s while running.
- [ ] Build `frontend/src/components/dashboard/sidebar.tsx` — wordmark, nav links, active state via `usePathname`, hardcoded `0` QUEUE badge, bottom status dot + Logout.
- [ ] Create `frontend/src/app/dashboard/layout.tsx` — Tier 1 main shell wrapping all `/dashboard/*`.
- [ ] Update `frontend/src/app/dashboard/page.tsx` — placeholder noting overview ships in `dashboard-overview` feature.
- [ ] Add placeholder pages for `/dashboard/queue`, `/dashboard/scheduled`, `/dashboard/published`, `/dashboard/settings`.
- [ ] Vitest tests: `sidebar.test.tsx` (all links render, active state by route), `chamfered-panel.test.tsx` (renders with correct cut + tier).

## Verification
- [ ] `cd frontend && npm run typecheck` passes with no new warnings.
- [ ] `cd frontend && npm run lint` passes.
- [ ] `cd frontend && npm test` passes (Vitest).
- [ ] `cd frontend && npm run dev` — manual browser walkthrough:
  - Hit `/dashboard` while logged out → redirect to `/login`.
  - Log in → land on `/dashboard`; sidebar renders with all 5 links + status dot + logout.
  - Click each sidebar link → placeholder pages render under the shell, active link updates.
  - Inspect: body shows orange grid; sidebar + main shell are `#000` with orange perimeter @ 40% + 20px dual chamfer; cut lines are real diagonals.
  - Resize to mobile width → sidebar collapses.
  - Visit `/login` → page still looks right with the new orange accent.
- [ ] Screenshot of `/dashboard` checked against `Design/README.md` Surface 2 spec.
