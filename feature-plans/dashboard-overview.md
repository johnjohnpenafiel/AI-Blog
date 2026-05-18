---
status: done
started: 2026-05-18
completed: 2026-05-18
---

# Feature: dashboard-overview

## Goal

Give the operator an at-a-glance command center on `/dashboard` — 4 stat cards covering system health and one-click pipeline control — composed from endpoints built in earlier phase-3 features.

## Scope

- 4 Tier 2 stat cards: Posts Published, Pending Review (orange-activated when > 0), Last Run, Next Run
- `⚡ TRIGGER PIPELINE` primary button that fires `POST /pipeline/run`
- `GO TO QUEUE →` outline button, conditional on pending review count > 0
- Live-ish refresh while a run is in progress (polling, not WebSocket)

## Out of scope

- Charts, sparklines, or any time-series visualization
- Confirmation modal on Trigger Pipeline (one-click fire)
- Loading skeletons + polished empty states (deferred to phase-5 `ui-polish`)
- Real-time WebSocket push from backend

## Success criteria

- All 4 stat cards display live values pulled from the backend on `/dashboard`
- Clicking Trigger Pipeline fires `POST /pipeline/run`; sidebar status dot reflects RUNNING; card values update once the run completes
- Go To Queue button is rendered **only** when pending review count > 0 and links to `/dashboard/queue`
- Manual browser verification passes; `npm run typecheck` and `npm run lint` clean

## Tasks

- [x] Wire `/dashboard/page.tsx` route through `DashboardPageShell` with title `Pipeline Overview` and label `// 01`
- [x] Build `StatCard` component (Tier 2: 16px top-left chamfer, dark perimeter + orange cut line, JetBrains Mono label, Inter 900 value) with optional sub-line and `activated` orange variant
- [x] Client-side fetchers for `GET /posts?status=published`, `GET /posts?status=pending_review`, and `GET /pipeline/status` (reuses `listPosts` / `getPipelineStatus` from `lib/api.ts`; pending count is sourced from the existing `QueueCountProvider` so the sidebar QUEUE badge stays in sync)
- [x] Posts Published card — count only (sub-line deferred per scope decision; no backend `published_after` filter exists)
- [x] Pending Review card — count, flips to orange (label, value, 3px accent left border) when > 0
- [x] Last Run card — relative timestamp via `formatRelative`; Chakra Petch 22px value
- [x] Next Run card — `MON MAY 18` date via `formatWeekdayDateUpper`; `08:00 AM` accent sub-line via `formatTimeOfDay`
- [x] `TriggerPipelineButton` — primary (orange fill, 12px dual chamfer); calls `POST /pipeline/run`; handles `PipelineConflictError` (409); calls `onCompleted` so the parent revalidates dashboard data
- [x] `GoToQueueButton` — outline, conditional render when `pending > 0`, links to `/dashboard/queue`
- [x] Live-ish refresh: `OverviewClient` polls `/pipeline/status` at 5s while running / 30s while idle (matches `PipelineStatusDot`); on running→idle transition, refetches published count + calls `refreshPending()` so all four stat cards reflect the new state

**Deviations from initial plan:** Each card type was implemented as inline `<StatCard …>` usages in `OverviewClient` rather than four separate per-card files. The per-card wrappers would have been thin (just label/value/className), so collapsing them avoids over-abstraction while keeping `StatCard` reusable for future stats. Fetching is client-side via `lib/api.ts` (matches `QueueClient`, `SettingsClient`, etc.) rather than a server component, so the polling loop and `useQueueCount` context work without prop-drilling.

## Verification

- [x] Manual browser walkthrough with backend running
- [x] Pending Review orange-activation visual check (force a `pending_review` post, reload, confirm orange label/value/left border)
- [x] Conditional Go To Queue check (absent at 0 pending, visible + linking when ≥ 1)
- [x] `cd frontend && npm run typecheck && npm run lint` pass (also: `npm test` — 40/40 passing, no regressions)
