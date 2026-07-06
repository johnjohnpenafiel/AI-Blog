# The Garage AI — UI Design Brief (v3.0)

> **Source of truth for visual decisions on both surfaces, as built.** v3.0 reconciles this document with the shipped code: the public surface was completely redesigned (the "Stage" language, from the Claude Design handoff in `design-handoff/`), and the dashboard evolved its tokens and typography. The old v2.0 brief described the chamfer/Tron system as sitewide — that is no longer true and this rewrite replaces it.
>
> **Where things live:**
> - Page-by-page structure and element names → **`Design/site-map/`** (one file per section; run `/sync-site-map` to verify it's current).
> - Why past visual choices were made → **`Design/decisions.md`** (dated log, new entries on top).
> - The public redesign's handoff artifacts and integration review → **`design-handoff/`** (`REVIEW.md`).
>
> **Naming:** "The Garage AI" is the public brand, used everywhere in code and user-facing copy. "DeLorean" was the internal codename of the MVP-era design language; it survives only in historical decision-log entries.

## What Is The Garage AI

An automated news site covering AI and operational technology in the automotive industry, publishing three times a week (Mon Brief / Thu Deep Dive / Fri Roundup). Two surfaces:

- **Public Blog** (`/`, `/blog/[slug]`, `/about`) — where readers discover and read dispatches.
- **Admin Dashboard** (`/dashboard/*`, `/login`) — where a single operator runs the publishing pipeline.

## Two design languages, one brand

The surfaces deliberately do **not** share one visual system. Each has its own language, tuned to its job — but they share brand constants so they read as one product:

| | Surface 1 — Public ("the Stage") | Surface 2 — Dashboard ("the Cockpit") |
|---|---|---|
| Feel | Editorial broadsheet × dark console | Operational command center / HUD |
| Corners | Square everywhere (radius 0, defensively enforced) | Chamfered (45° cuts) — no radius either |
| Background | Neutral **gray** ramp (`#1a1a1a` base) | **Black** chassis (`#0a0a0a` body, `#000` panels) |
| Chrome font | DM Mono | IBM Plex Mono |
| Editorial font | Archivo (variable width, run extended) | Archivo (`--font-editorial`, post content only) |
| Token namespace | `--tg-*`, scoped under `.tg-surface` | `:root` tokens + Tailwind `@theme` utilities |
| Stylesheet | `frontend/src/app/(public)/public-theme.css` | `frontend/src/app/globals.css` |

**Shared brand constants (byte-identical across surfaces):**
- **Orange `#e85002`** — the primary accent (`--tg-orange` = `--accent`). The only saturated hue besides the public surface's sand and the dashboard's semantic state colors.
- **Text ramp** — `#f9f9f9` / `#a7a7a7` / `#646464` (`--tg-ink`/`--tg-mute`/`--tg-faint` = `--text-primary`/`--text-secondary`/`--text-dim`).
- **Single dark theme.** No light mode, no toggle, ever.
- **Mono chrome / editorial content split.** On both surfaces, UI machinery speaks monospace and content speaks Archivo — type encodes what belongs to the tool vs. what belongs to the publication.

**The scoping rule (non-negotiable):** every public token is namespaced `--tg-*` and every public rule nests under `.tg-surface`; the dashboard uses `:root` tokens and Tailwind utilities. Neither surface may reference the other's tokens — the two color ramps share *values* by deliberate copy (see the 2026-06-09 decision), not by `var()` reference. New public UI never uses Tailwind theme utilities; new dashboard UI never uses `--tg-*`.

---

# Surface 1 — Public Blog ("the Stage")

## Aesthetic direction

A dark editorial console: a print-flavored broadsheet run through terminal chrome. The whole site is a **stage** — a 3px gray frame insets the viewport, a fit-to-width wordmark and scrolling headline ticker crown it, and every page is a vertical stack of full-width **bands** indexed by a mono marker in a left gutter, like a numbered contact sheet. Square corners everywhere; hierarchy comes from the gray ramp, hairline rules, and type — never from rounding or heavy borders. Orange is load-bearing (CTAs, live states, links, the featured star); sand is the quieter second voice (kickers, thesis lines).

## Color tokens (`--tg-*`)

| Token | Value | Usage |
|---|---|---|
| `--tg-ink-black` | `#0a0a0a` | Ticker band background; text-on-orange (buttons, active chips). |
| `--tg-bg` | `#1a1a1a` | Base page/band background. |
| `--tg-band` | `#242424` | Alternate (lifted) band background — used to stripe sections. |
| `--tg-card` | `#2a2a2a` | Post cards. |
| `--tg-card-hover` | `#303030` | Card hover. |
| `--tg-frame` | `#646464` | The stage frame, masthead/ticker rules, chip + ghost borders. |
| `--tg-frame-hair` | `#333333` | Hairline rules — band separators, card borders, list dividers. |
| `--tg-ink` | `#f9f9f9` | Primary text. |
| `--tg-mute` | `#a7a7a7` | Secondary text — summaries, meta. |
| `--tg-faint` | `#646464` | Lowest-emphasis chrome — gutter markers, fine print. |
| `--tg-ink-soft` | `#cfcbc5` | Warm off-white — resting dispatch headlines, tag chips. |
| `--tg-orange` | `#e85002` | THE accent. CTAs, links, live dots, section diamonds, active states. |
| `--tg-orange-bright` | `#f16001` | Button hover; the Roundup format accent. |
| `--tg-red` | `#c10801` | Reserved deep red (halftone art direction). |
| `--tg-sand` | `#d9c3ab` | Secondary warm accent — kickers, thesis lines, the Deep Dive format accent, copy-link confirm. |
| `--tg-halftone-field` | `#2a0700` | Image-slot field color (dark burnt ground for future halftone art). |

Layout variables: `--tg-gutter` (132px desktop / 64px small), `--tg-frame-pad` (frame inset, clamp), `--tg-content-pad` (band right padding, clamp).

**Format accents** (`lib/public-format.ts` → `formatAccent`): Brief = orange, Deep Dive = sand, Roundup = orange-bright. Used to tint format chips, mode cards, and post-card accents.

## Typography

| Role | Font | Treatment |
|---|---|---|
| Display — wordmark, headlines, band headings | **Archivo** 700 (variable `wdth` axis) | Run **extended**: `font-stretch` 110–125% (wordmark 125%, hero/dispatch headlines 112–118%), tight leading (0.96–1.1), slight negative tracking. |
| Editorial body — summaries, prose, ledes | **Archivo** 400–500, stretch 108–112% | Article prose 18px/1.62; ledes and standfirsts larger (21–22px). |
| Chrome — kickers, meta, buttons, chips, markers, ticker | **DM Mono** 300/400/500 | 8–12px, letter-spacing 0.08–0.3em, mostly uppercase. |

Rules: no serifs; chrome is always DM Mono; headlines are always extended Archivo; the ticker, gutter markers, and all labels stay mono uppercase. Post-card titles/excerpts are deliberately mono uppercase (the "card voice") — an exception to the Archivo-for-content rule, scoped to cards only.

## The stage (layout system)

Full anatomy in `site-map/public/_shell.md`; the rules:

- **Stage frame** — 3px `--tg-frame` border (top/left/right; no bottom — the floating bottom nav is the visual close), inset by `--tg-frame-pad`. A faint `.tg-scanline` texture overlays the whole stage.
- **Masthead** — fit-to-width Archivo wordmark block + the scrolling ticker (real dispatch headlines interleaved with orange brand taglines; pure CSS 60s loop).
- **Scroll model is a media-query split** (`.tg-stage*`): **desktop (>768px)** is the locked-viewport stage — 100dvh, masthead pinned, content scrolls *inside* the frame (the design's signature). **Mobile (≤768px)** is natural document scroll — the frame goes full-bleed with thin 2px side borders running the whole document, and the masthead scrolls away (the bottom nav is the persistent navigation). Anything scroll-linked must handle both scrollers.
- **Bands** — every page is a stack of `.tg-band` rows: `var(--tg-gutter)` marker column + content column, separated by `--tg-frame-hair` hairlines, optionally striped with `--tg-band`. The **gutter marker** is a small mono token in parentheses — a running index `(01)`, a count `(07)`, or a glyph `(★)` `(*)` `(↩)` `(src)` `(rel)` `(meta)` `(fig.0)` `(✶)`.
- **Bottom nav** — fixed, floating over the stage: boxed LogoMark left, mono links right, on blurred near-black panels.
- **LogoMark** (two overlapping rings) is the only drawn vector and — with tiny status dots — the only round geometry allowed.

## Component idioms

| Idiom | Treatment |
|---|---|
| **Kicker** | `// Label` — DM Mono 10px, 0.18em tracking, uppercase, orange (`.tg-kicker`) or sand. |
| **Section diamond** | `◆ SECTION` — orange mono token marking a post's section. |
| **Format chip** | Mono uppercase in a 1px outlined chip, tinted by the format accent (`color-mix` 33% border). |
| **Primary button** | `.tg-btn` — solid orange fill, ink-black mono uppercase text; hover → orange-bright. |
| **Ghost button** | `.tg-btn-ghost` — transparent, `--tg-frame` border, mute text; hover → ink text + orange border. |
| **Filter chip** | `.tg-chip` — outlined mono chip with a boxed count; active = solid orange with ink-black text. |
| **Nav link** | `.tg-nav-link` — mono uppercase, mute → ink on hover. |
| **Body link** | `.tg-body-link` — orange with a 40%-orange underline that solidifies on hover. |
| **Post card** | `.tg-card` — `--tg-card` surface, hairline border; hover lifts (translateY −3px, deeper shadow, orange-tint border). |
| **Dispatch row** | `.tg-dispatch` — full-width link row; hover washes the row faint-orange and turns index/read affordances orange. |
| **Share chip** | `.tg-share-chip` — 34px square mono button (`X` / `in` / `↗`); hover inverts to orange. |
| **Rule header** | pulse dot + mono label + stretching hairline + right-aligned mono count. |
| **Image slot** | `.tg-img-slot` — holds the post's **AI-generated cover** (fal.ai/Recraft, pipeline image step) via `object-fit: cover`, falling back to the framed placeholder + badge when `image_url` is null. Wired in the featured 16:9 and card 5:4 slots and the dashboard review panel. Reverses the old "no images" constraint; hidden on mobile per the redesign. |
| **Needs-content marker** | `.tg-needs` — loud dashed yellow chip marking intentional content gaps (the one sanctioned dashed border). |
| **Prose** (`.tg-prose`) | Article markdown: Archivo paragraphs (first paragraph enlarged as the lede), extended-Archivo headings, `>`-marker mono-orange lists, orange-rule blockquote pull quotes, mono code on `--tg-band`. |

## Motion

- `.tg-fade-up` — 0.7s rise-and-fade entrance, staggered by inline `animationDelay` (hero).
- `.tg-pulse` — 1.6s opacity pulse on live dots.
- Ticker — 60s linear infinite track loop.
- All three respect `prefers-reduced-motion: reduce`.

## Mobile layer (≤720px band collapse)

The desktop composition is not shrunk — it's **recomposed** (see the 2026-07-03 decision entries): bands drop the gutter (meaningful markers rejoin content via `.tg-m-only`), the reading-modes selector becomes a compact 2×2 grid (descriptions hidden), filter chips become one swipeable edge-bled row, the hero's duplicate card is dropped, empty image slots are hidden, tap targets grow on coarse pointers. Mobile shows less, better.

---

# Surface 2 — Admin Dashboard ("the Cockpit")

## Aesthetic direction

Dark operational command center. The chassis is near-black; the major structural panels (sidebar, main shell) are **pure black, recessed** into it (inverted layering — darker = deeper). Every load-bearing shape carries a **chamfered corner** with an orange cut line. Chrome is monospaced console text; the posts being managed keep their editorial face. Utilitarian, data-dense, HUD-flavored.

## Color tokens (`:root` → Tailwind utilities)

| Token | Value | Utility | Usage |
|---|---|---|---|
| `--bg` | `#0a0a0a` | `bg-bg` | Body background. |
| `--structural` | `#000000` | `bg-structural` | Sidebar + main shell + modal panels (recessed). |
| `--surface` | `#111111` | `bg-surface` | Cards, panels. |
| `--surface-raised` | `#181818` | `bg-surface-raised` | Hover states, card footer bands. |
| `--border` | `#222222` | `border-border` | Component perimeters. |
| `--border-dim` | `#1a1a1a` | `border-border-dim` | Hairline dividers. |
| `--text-primary` | `#f9f9f9` | `text-fg` | Headings, values. *(= public ink)* |
| `--text-secondary` | `#a7a7a7` | `text-muted` | Meta, secondary. *(= public mute)* |
| `--text-dim` | `#646464` | `text-dim` | Labels, fine print. *(= public faint)* |
| `--accent` | `#e85002` | `text-accent` etc. | The only accent. *(= public orange)* |
| `--accent-dim` | `#c24302` | `bg-accent-dim` | Orange hover. |
| `--accent-glow` | `rgb(232 80 2 / .12)` | `bg-accent-glow` | Active-nav tint, featured glow. |
| `--accent-structural` | `rgb(232 80 2 / .6)` | `border-accent-structural` | Tier 1 structural borders. |
| `--success` / `--warning` / `--destructive` | `#00c47d` / `#ff9a40` / `#e03434` | state colors | State only, never decoration. |

The v2.0 spec's body-grid chassis texture (`--grid`) was never implemented and its token has been removed — the dashboard body is flat `--bg`. If a chassis texture is ever wanted, treat it as a new design decision.

## Typography

| Role | Font | Notes |
|---|---|---|
| ALL dashboard chrome — nav, labels, page titles, stats, buttons, dates, badges | **IBM Plex Mono** 400–700 | The default: `--font-sans/mono/display` all resolve to it (`font-mono`, `font-display` utilities). Small sizes, wide tracking (0.2–0.45em), uppercase. |
| Post content only — card titles + summaries, review-panel title, markdown preview | **Archivo** via `--font-editorial` (`font-editorial`) | A post looks like the published work it will become; normal width here, not the public extended treatment. |

Chakra Petch, JetBrains Mono, Fraunces, and Inter are **gone** — remove on sight. The rule: *machinery is IBM Plex Mono; the content the machinery manages is Archivo* (see the 2026-06-09 decisions).

## Depth hierarchy (inverted layering)

1. **Body** `#0a0a0a` — the chassis.
2. **Structural** `#000` — sidebar, main shell, review panel: recessed cuts into the chassis.
3. **Cards** `#111` — lifted above the shell.
4. **Raised** `#181818` — hover states and card footer bands.

## Chamfer geometry — the structural signature

Every **structural panel and post-bearing card** uses a 45° corner cut, implemented as a real `clip-path` cut with an SVG-stroked edge — never a painted line, never `border-radius`. **Build nothing by hand: use `ChamferedPanel`** (`frontend/src/components/chamfered-panel.tsx`), which encapsulates sizes, cut patterns, and both border tiers.

- Cut sizes scale with hierarchy (chips → buttons → cards → shells).
- Patterns: **single** top-left (content cards), **dual** TL+BR (buttons), **mirrored** on facing edges (sidebar cuts left, main shell cuts right — interlocking armor plates across the gutter).
- Two hard rules: true 45° (equal H+V offset) and real cuts through geometry.

**As-built refinement:** the chamfer marks *chassis and posts*. Utility readouts — the settings cards, the featured spotlight, the login card — are **plain rectangles** with a standard `--border` perimeter. Don't chamfer everything; the cut means "structure or content artifact."

## Border tiers

- **Tier 1 — Structural**: uniform orange @ 60% (`--accent-structural`) around the whole clipped shape (perimeter and cuts read as one continuous line). Sidebar, main shell, review panel.
- **Tier 2 — Component**: dark `#222` perimeter, orange **only on the chamfer cut lines**. Cards, buttons.
- Plain-rectangle utility panels: `--border` perimeter, no orange.

## Recurring patterns

- **Section Header** (`section-header.tsx`) — `// NN` orange counter + label + full-width `--border-dim` rule. Sections are named, not boxed. Counters stay sequential in display order.
- **Data cards / stat readouts** — three-slot hierarchy: primary value (dominant), sub-line (complementary dimension), footer (persistent context). If a slot has no meaningful data, omit it; never placeholder. Pending Review activates full-orange when > 0.
- **Card footer band** — `--surface-raised` strip + hairline divider holding date · eval badge · actions.
- **Buttons** — the one shared `Button` (`components/button.tsx`): primary (orange fill, dark text) / outline / ghost / destructive / link.
- **Eval Badge / Taxonomy row** — every post surface carries its generation-eval readout and `SECTION · FORMAT` tokens (measurement is first-class).
- **Two-step confirms** — destructive or irreversible row actions (reject, publish now, unschedule) swap the button for a confirm/cancel pair inline; no browser dialogs.

## Scroll behavior — locked viewport (hard rule)

The dashboard is a cockpit, not a page: the viewport is pinned (`h-screen overflow-hidden`), the sidebar and shell chamfers never leave the screen, the page title is fixed, and **only the content region below the title scrolls** — with a clean hard cut, no fade mask. Every route renders through `DashboardPageShell` (`components/dashboard/page-shell.tsx`); never bypass it. On mobile the sidebar becomes a slide-in drawer behind a `≡ MENU` trigger.

---

## Rules — both surfaces

| ✓ DO | ✗ NEVER |
|---|---|
| Square corners (public) / real `clip-path` chamfers via `ChamferedPanel` (dashboard) | `border-radius` anywhere (LogoMark rings + status dots are the only circles) |
| Orange `#e85002` as the accent, load-bearing | Any other saturated accent (sand + semantic states are the sanctioned exceptions) |
| DM Mono (public) / IBM Plex Mono (dashboard) for all chrome, uppercase + tracked | Serif fonts; Chakra Petch / JetBrains Mono / Inter / Fraunces (all retired) |
| Archivo for editorial content, extended on public display | Extended Archivo in dashboard card rows (overflow) |
| `--tg-*` on public, `:root`/Tailwind on dashboard | Cross-surface token references |
| Solid borders (public hairlines / dashboard tiers) | Dashed borders (exception: the `.tg-needs` marker) |
| Single dark theme | Light mode, toggles |
| Image slots as marked placeholders (public) | Photography in the **dashboard**; unmarked empty boxes |
| State colors for state | Semantic colors as decoration |

## Fonts to load

Loaded once via `next/font` in the root layout (`frontend/src/app/layout.tsx`) — no Google Fonts `<link>`:

- **Archivo** — variable, with the **`wdth` axis** (required for `font-stretch`); `--font-archivo`. Both surfaces.
- **DM Mono** — 300/400/500; `--font-dm-mono`. Public chrome.
- **IBM Plex Mono** — 400/500/600/700; `--font-ibm-plex-mono`. Dashboard chrome.

## Implementation notes

- **Chamfers**: `clip-path` clips fill but doesn't stroke the cut edge — `ChamferedPanel` pairs the clip with an absolutely-positioned SVG overlay (`vector-effect="non-scaling-stroke"`). Reuse it; don't re-derive.
- **Public scoping**: `public-theme.css` is imported only by the `(public)` layout; everything nests under `.tg-surface`. The root `<body>` classes belong to the dashboard's token world — the public surface overrides them inside its own wrapper.
- **Mobile band collapse** lives as classed `!important` overrides in `public-theme.css` over the components' inline desktop styles — the established pattern; follow it for new public sections.

## Page-by-page UI structure

Moved to **`Design/site-map/`** — one file per page section with the element tree and source component. Run `/sync-site-map` before design sessions to guarantee it matches the code.
