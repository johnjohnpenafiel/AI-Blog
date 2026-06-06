# Public Redesign — Review Log

> Autonomous integration of the Claude Design handoff into the public site.
> Branch: `feature/public-redesign`. Dashboard intentionally untouched.
> This file is the single place to see what got built, what needs your eyes,
> and what's waiting on content. Updated continuously during the run.

**Design at a glance (what changed vs. the old site):** a complete visual
overhaul — square corners (radius 0, no chamfers), Archivo (extended) + DM Mono
fonts, a neutral gray ramp with orange + sand as the only accents, and a
"stage-frame" layout (3px gray frame, indexed left gutter, scrolling headline
ticker, halftone imagery). The old chamfer/Tron system is gone on the public
surface. The **dashboard keeps the old system** — all new tokens are scoped so
the dashboard is unaffected.

---

## 1. Completed

_(updated as each piece lands)_

- **Public API — `format` field.** Added `format` to `PublicPostListItem` and
  `PublicPostDetail` (backend `schemas/public.py` + `routers/public.py`) and the
  matching frontend types (`lib/public-api.ts`). The new design keys off
  format (Brief / Deep Dive / Roundup / Explainer) in the reading-modes,
  dispatch rows, and breadcrumbs, and it wasn't previously exposed publicly.

---

## 2. Decisions to review

_(choices I made that you should confirm match your intent)_

- **Touched the backend `/public/*` endpoint (not just the frontend).** The
  design needs each post's `format`, which the public API didn't return. I added
  it as a server-only, additive field (no new table/endpoint/migration, no
  dashboard impact). Alternative was to fake/omit format on the frontend, which
  would violate "don't hardcode dynamic data." → Confirm you're OK with the
  public response gaining a `format` field.

---

## 3. Needs content

_(every on-screen ⟨NEEDS CONTENT⟩ marker and what it's waiting on)_

- _none yet_

---

## 4. Open questions

_(anything I couldn't resolve)_

- _none yet_
