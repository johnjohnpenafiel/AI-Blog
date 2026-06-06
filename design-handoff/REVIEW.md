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

---

## 2. Decisions to review

_(choices I made that you should confirm match your intent)_

- **Touched the backend `/public/*` endpoint (not just the frontend).** The
  design needs each post's `format`, which the public API didn't return. Added
  it as a server-only, additive field (no new table/endpoint/migration, no
  dashboard impact). → Confirm you're OK with the public response gaining a
  `format` field.

- **Locked-viewport stage (vs. natural scroll).** The layout faithfully
  recreates the handoff's 100dvh stage with an internal scroll region (fixed
  masthead, content scrolls inside the frame). It's the design's signature but
  trades away native page scroll, which has SEO/mobile implications (you care
  about SEO in Phase 4). It's isolated to `(public)/layout.tsx`, so flipping to
  a sticky-masthead + natural-document-scroll later is a one-file change.
  → Confirm you want the locked stage, or want me to switch to natural scroll.

- **Cadence copy corrected: "three a week," not "two."** The handoff's sample
  copy said *twice-weekly / "Two dispatches a week"*, but the real pipeline
  publishes **three times a week** (Mon Brief / Thu Deep Dive / Fri Roundup). I
  used the accurate "three dispatches a week" everywhere and set the hero stat
  to `3× WEEKLY`. → Confirm the real cadence (I assumed PLANNING.md is correct).

- **Post-card `>` points = the post's tags.** The design's cards show a 3-item
  "point list" of clipped noun-phrases that don't exist in our data model. I
  bound them to each post's real `tags` (1–2 items) rather than invent phrases.
  → Fine, or do you want a dedicated short "points" field generated per post?

- **Featured story = the most recent post.** The design shows the top story in
  three places (hero card, featured band, dispatch row 01); I mirrored that with
  the cover post. → Confirm you're OK with the cover appearing in all three, or
  want the featured band to pick a different/editor's-choice post.

- **Reading-mode stats are data-driven.** `SECTIONS` / `FORMATS` counts in the
  hero are computed from the loaded posts (distinct values), not hardcoded to
  the design's "4 / 4". Explainer mode will read empty until that format ships.

---

## 3. Needs content

_(every on-screen ⟨NEEDS CONTENT⟩ marker and what it's waiting on)_

- **Subscribe flow** — `⟨NEEDS CONTENT: subscribe flow⟩` marker shown beside the
  hero CTA; the "Subscribe" buttons in the hero and bottom nav are rendered but
  inert + dimmed (Phase 4 newsletter — no destination yet).
- **Image slots (all placeholders except the hero video).** Every non-hero image
  in the design is a clearly-marked `IMAGE` placeholder slot, sized/positioned
  per the design, waiting on real art (or a procedural-halftone implementation):
  - Post cards in the reading-modes grid (5:4 header).
  - Featured-story image (16:9).
  - Related-dispatch cards + the article hero image (on the dispatch page —
    built in the next step).

---

## 4. Open questions

_(anything I couldn't resolve)_

- **Section accent colors simplified.** The design tinted the `◆` section flag
  per-section (mostly orange, sand for Inventory). I used orange for the section
  flag and reserved sand/hot-orange for the *format* accent. Easy to expand to a
  full per-section color map if you want the extra variety.
