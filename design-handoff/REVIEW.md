# Public Redesign — Review Log

> Autonomous integration of the Claude Design handoff into the public site.
> Branch: `feature/public-redesign`. Dashboard intentionally untouched.
> This file is the single place to see what got built, what needs your eyes,
> and what's waiting on content.

## Status: ✅ COMPLETE — ready for your review

**Verification (all green):**
- `npm run typecheck` → exit 0
- `npm run lint` → exit 0
- `npm run build` → exit 0 (✓ Compiled successfully)
- `npm test` → 70 passed / 13 files
- **Dashboard untouched:** the diff vs `main` touches no `dashboard/` files, no
  `globals.css`, no `components/ui/`, no Tailwind config. The *only* shared file
  changed is the **root** `app/layout.tsx`, and that change is purely additive
  (loads Archivo + DM Mono); the `<body>` class is unchanged, so the dashboard
  renders exactly as before. All new public tokens are namespaced `--tg-*` and
  scoped under `.tg-surface`.

**To see it locally:** `cd frontend && npm run dev`, then open `/`, `/blog/<slug>`,
and `/about`. Live data needs the backend running (`docker compose up -d`) and at
least one published post; otherwise the index shows its empty state.

**Backend note:** the public API gained a `format` field (additive). The schema
shape test was updated; I did **not** run `pytest` here (no DB/Docker in this
unattended run) — worth a `docker compose run --rm backend pytest` before merge.

**Top things to look at first:** the locked-viewport decision (§2), the cadence
copy correction (§2), and the image placeholders (§3).

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

- **Fonts + scoped theme.** Archivo (with the `wdth` axis for the extended
  display look) + DM Mono loaded via `next/font` (additive — dashboard keeps
  Inter/JetBrains/Fraunces). All design tokens namespaced `--tg-*` and every
  rule scoped under `.tg-surface` in `(public)/public-theme.css`, so the
  dashboard's `:root` tokens and Tailwind `@theme` are untouched. Real
  `hero.mp4` copied to `/public`.

- **Shared chrome (the stage frame).** `(public)/layout.tsx` rewritten as the
  3px frame + fixed masthead (fit-to-width Archivo wordmark + scrolling
  ticker) + internal scroll region + fixed bottom nav + rebranded footer. New
  components: `LogoMark`, `Wordmark`, `Ticker`, `BottomNav`. The old `PublicNav`
  was removed. Ticker is fed real recent headlines + brand taglines.

- **Homepage (`/`).** Fully rebuilt and bound to live `/public/posts`:
  - **Intro band** with the real hero video background + cover-post "latest
    dispatch" card, CTAs, and stats.
  - **Reading-modes band** — the four formats as selectable cards; each surfaces
    the latest dispatches of that format (filtered live by `format`).
  - **Featured band** — the cover dispatch shown large.
  - **Dispatch index** — data-driven section filter chips (only sections that
    exist, with live counts) + the editorial dispatch rows.
  - Clean empty state before the first post is published.

- **Dispatch page (`/blog/[slug]`).** Fully rebuilt: breadcrumb (Index /
  section / format), title block (section + format + lede), metadata strip
  (Published / By / Read time / Filed under + working Share chips), lead-image
  placeholder, themed markdown body (`.tg-prose` — Archivo prose, mono-orange
  `>` lists, orange-rule pull quotes), a **Sources band** (added — see below),
  a live **Related dispatches** grid (same section first), and the Subscribe
  CTA. Old `PostBody` / `ShareBar` removed; `SourcesList` restyled.

- **About page (`/about`).** Recomposed in the design language (gutter bands,
  `//` kickers, extended-Archivo headings + prose), with accurate copy: the
  thesis, What We Cover, How It Works (the real 3×/week Mon-Thu-Fri pipeline),
  and the operator-first POV. The route-transition `loading.tsx` was re-themed
  to the stage as well.

- **Tests.** Replaced the deleted `posts-index` test with a `dispatch-index`
  test (data-driven chips + section filtering). Full suite green — 70 tests,
  13 files.

---

## 2. Decisions to review

_(choices I made that you should confirm match your intent)_

- **Touched the backend `/public/*` endpoint (not just the frontend).** The
  design needs each post's `format`, which the public API didn't return. Added
  it as a server-only, additive field (no new table/endpoint/migration, no
  dashboard impact). → Confirm you're OK with the public response gaining a
  `format` field.

- **Locked-viewport stage (vs. natural scroll). ✅ RESOLVED (2026-06-08).** Keep
  the locked 100dvh stage on **desktop**; switch to **natural document scroll on
  mobile**. (SEO indexing is unaffected by the locked viewport — the cost is
  mobile usability, which feeds ranking second-order.) Build is **deferred to
  Phase 4** (Distribution/SEO). Captured as an idea in
  `notes/v2-ideas.md` → "Responsive Scroll: Desktop-Locked / Mobile-Natural."
  Site stays fully locked at all breakpoints until then.

- **Cadence copy corrected: "three a week," not "two."** The handoff's sample
  copy said *twice-weekly / "Two dispatches a week"*, but the real pipeline
  publishes **three times a week** (Mon Brief / Thu Deep Dive / Fri Roundup). I
  used the accurate "three dispatches a week" everywhere and set the hero stat
  to `3× WEEKLY`. → Confirm the real cadence (I assumed PLANNING.md is correct).

- **Post-card `>` points = the post's tags.** The design's cards show a 3-item
  "point list" of clipped noun-phrases that don't exist in our data model. I
  bound them to each post's real `tags` (1–2 items) rather than invent phrases.
  → Fine, or do you want a dedicated short "points" field generated per post?

- **Featured story = the most recent post. ✅ RESOLVED (2026-06-08).** Keep
  auto = most-recent for now (cover shown in all three slots). Making it an
  **admin-selected editor's choice** (pinned from the dashboard) is logged as a
  future idea in `notes/v2-ideas.md` → "Featured Story: Admin-Selected (Editor's
  Choice)." No change now.

- **Reading-mode stats are data-driven. ✅ RESOLVED (2026-06-08).** `SECTIONS` /
  `FORMATS` counts in the hero are computed from the loaded posts (distinct
  values), not hardcoded to the design's "4 / 4". Explainer mode reads empty
  until that format ships — expected, not a bug; logged in `notes/v2-ideas.md`
  under Format Index (the mode fills automatically when Explainer launches, no
  frontend change needed).

- **Byline is "The Garage Desk."** Posts have no author in the data model; I
  used the publication's desk name (the brand voice in the handoff), not a
  fabricated person. → Fine, or do you want a real/configurable byline?

- **Added a Sources band the handoff didn't have.** "Every post lists its
  sources" is a project non-negotiable, but the handoff's dispatch had no
  sources section. I built one in the design language (gutter row, mono header,
  orange-underline links). → Confirm placement (currently between the body and
  related dispatches).

- **Omitted three sample-only article bands.** The handoff dispatch had a stat
  band (`0s / 24/7 / +22% / 3.1×`), a standalone pull-quote, and a capability
  list — all hardcoded to the sample story with no equivalent in our data model.
  I omitted them rather than fabricate numbers. Pull quotes / lists / subheads
  still render *when present in the post's own markdown* (themed via `.tg-prose`).
  The handoff's "About the desk / Go further" band was also dropped (it overlaps
  the footer + related grid). → Say if you want any of these back, generated
  per post.

---

## 3. Needs content

_(every on-screen ⟨NEEDS CONTENT⟩ marker and what it's waiting on)_

- **Subscribe flow — REMOVED (2026-06-08).** Per decision, all Subscribe UI was
  pulled until the newsletter is actually built (Phase 4): the hero ghost button
  + `⟨NEEDS CONTENT⟩` marker, the bottom-nav Subscribe link, and the entire
  Subscribe CTA band on the post page (component `subscribe-cta.tsx` deleted).
  Re-add when the flow ships. (The generic `tg-needs` marker class is kept in
  `public-theme.css` for other content gaps; it renders nowhere now.)
- **Image slots (all placeholders except the hero video). ✅ DECISION (2026-06-08):
  leave as-is for now.** Every non-hero image is a clearly-marked `IMAGE`
  placeholder slot, sized/positioned per the design:
  - Post cards in the reading-modes grid (5:4 header).
  - Featured-story image (16:9).
  - Related-dispatch cards (5:4 header) on the dispatch page.
  - Article **lead image** (16:9, labelled `FIG.0 — Lead image placeholder`).

  These will be filled by **per-post image generation in the pipeline** (likely
  Grok Imagine API) — the planned next step **before Phases 4–5**. Logged in
  `notes/v2-ideas.md` → "Per-Post Image Generation (in-pipeline)."

---

## 4. Open questions

_(anything I couldn't resolve)_

- **Section accent colors simplified.** The design tinted the `◆` section flag
  per-section (mostly orange, sand for Inventory). I used orange for the section
  flag and reserved sand/hot-orange for the *format* accent. Easy to expand to a
  full per-section color map if you want the extra variety.
