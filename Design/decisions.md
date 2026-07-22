# The Garage AI — Design Decision Log

> Visual-design decisions with their full context, rationale, and tradeoffs. Separated from `PLANNING-decisions.md` so design concerns stay independent from architecture/product concerns. Read this file when you need to know *why* a past visual choice was made.
>
> The current visual spec lives in `Design/README.md` — this file captures *changes* to that spec over time. ("DeLorean" in older entries is the retired MVP-era codename.)

New entries at the top.

### 2026-07-22 — "/ Statistics" marquee band on the homepage (stripe.dev reference)

**Context**: stripe.dev closes its landing content with a `/ STATISTICS` marquee — an infinite mono crawl of `LABEL: [value]` pairs in dashed chips. The Garage AI's version tells the machine's own numbers (dispatches, sources cited, covers generated, human edits: 0 — radical transparency about the automated pipeline). Lives between the homepage featured/latest spotlight and the News index (`stats-ticker.tsx`).

**Decisions**:

- **Same band grammar as the landing**: `zoom: 0.8` page scale, `/ Statistics` head in the spotlight labels' spec (mono 15.6px / 0.14em / faint) with its rule inset 16px off the walls; the moving strip itself runs full-bleed.
- **Value chips are dashed SAND, not gold.** The Stripe reference's dashed value chips map onto our dashed-chip voice, but the gold literal stays scoped to the post/relcard chips — sand is the sanctioned secondary accent, so `.tg-stat-chip` (sand text, `rgb(217 195 171 / .5)` dashed border) becomes a new sanctioned dashed surface without extending the gold scope. (A gold pass was tried on the operator's request and reverted same-day — sand won on screen.)
- **Dashed separators between pairs** (18px dashed `--tg-faint` verticals) — dashed = machinery, same as the filter-bar/meta dividers.
- **Motion**: pure-CSS crawl — the track holds two identical runs (second `aria-hidden`) and translates −50% over 40s linear, so the loop is seamless; pauses on hover; `prefers-reduced-motion` swaps the crawl for a hand-scrollable static strip.
- **Data honesty**: stats derive server-side from the already-fetched post list (dispatches, covers, read-minutes, the constant human-edits 0). Sources-cited / publishers-read are deliberately absent until the pipeline persists run metadata (Trello: "Track articles-screened count in the pipeline") — no invented numbers on the wire.

### 2026-07-19 — News-index rows become expandable drawers (Stripe-reference)

**Context**: Homepage index rows were one-line links straight to the post. Per the Stripe-blog reference, a row now opens an inline detail drawer first; reading is an explicit second step.

**Decisions**:

- **Row = toggle, drawer = detail, Read = navigation.** `.tg-row-main` (a button) toggles `.tg-row-drawer`: mono labels `Summary:` / `Section:` / `Format:` / `Topics:` aligned under the date column (172px grid), Archivo 19px values, gold topic chips, and a full-width mono `Read` ghost link (frame border, orange flood on hover). Section/Format rows are omitted when null. (The reference's AUTHOR field has no equivalent — single-operator blog.)
- **Hover floods only the title line.** The magenta `#ff3d97` flood moved from `.tg-row` to `.tg-row-main`, so an open drawer stays on the page tone (per the reference's green-flood-on-title-only).
- **Open rows drop the ellipsis** — the full title wraps; the ↗ read affordance (and its truncation-measuring JS) is retired since the drawer's Read button owns navigation. The `+` glyph flips to `—` while open.
- **Motion reuses the mini-title spring**: `grid-template-rows 0fr→1fr` + fade + 6px lift on `cubic-bezier(0.22, 1, 0.36, 1)` over 0.55s, so the rows below get pushed/pulled smoothly. The drawer stays mounted (needed for the close leg) with `inert` gating focus; `prefers-reduced-motion` disables the slide. Phones collapse the drawer grid to a label-over-value stack.
- **Blue-violet `#948bff` drawer labels** — a third sanctioned canvas literal (after magenta and gold), scoped strictly to `.tg-drawer-label`. Tried on the row dates + bullets too — rejected there (too much presence at index volume); labels-only won. A cooler `#7d9bff` variant was also tried and rejected.

### 2026-07-19 — Post-page polish pass: image frames, related-card chrome, section rules

**Context**: First round of one-thing-at-a-time polish on the post page, styled against Stripe-blog references. Iterated live with the operator; all values below are the landed ones.

**Decisions**:

- **Matte image frames (cover + inline article images).** The cover figure (`.tg-fig-frame`) and any inline body image (`.tg-article p img`) sit in a **24px matte border of `#22252a`** — the page bg (`#17191c`) lifted in brightness with its cool cast kept, so the image reads as *raised page*, not a foreign gray (tried `--tg-band` and `#2b2f36` first; both too loud/neutral). Hairline (`--tg-frame-hair`) closes the outer edge via box-shadow; **6px border-radius** — a deliberate, sanctioned exception to the public "radius 0" rule, scoped to these frames. Cover caption reads just **"Cover"** (the `FIG.0 —` prefix retired).
- **Related-card window chrome.** `.tg-relcard-fig` renders as console-window chrome: a **24px empty title bar** on top and **7px side/bottom** matte around the 1:1 image pane (no `[ FIG. n ]` text/icons — frame only). Color journey: silver `#c2c7ce` per the reference → `--tg-frame` → `--tg-frame-hair` → landed on **`#2d2f33`** — the post-frame matte's brightness pulled toward neutral gray (the blue cast read as "sky" at card size; near-neutral reads as chrome).
- **10% page-tone image overlay, sitewide.** Every rendered cover dims under `rgba(23,25,28,.1)` (a `::after` on `.tg-relcard-frame` / `.tg-fig-frame`, guarded off the `.tg-img-slot` placeholder whose `::after` is the IMAGE badge); inline article images approximate it with `filter: brightness(.91)` (bare `<img>`, no pseudo-element). Blends the bright AI covers into the dark site. A burnt-orange variant (`--tg-halftone-field` at up to 35%, per the old halftone art direction) was tried and rejected — too heavy; the neutral page tone won.
- **Related-card tags = gold chips.** `.tg-relcard-chip` now uses the `.tg-meta-chip` recipe (mono 13px uppercase, canvas gold `oklch(0.82 0.17 75)`, dashed border) — extends the gold literal's sanctioned scope from the metadata sidebar to these tags. Card hover floods them magenta like the rest of the card. (An intermediate take styled them as plain filter-item labels; rejected.)
- **Section rule runs under the label.** `.tg-band-sec` bands (`/ Sources`, `/ Related articles`) drop the band-top hairline; `.tg-seclabel` carries a full-width rule *below* the label (14px below label, 40px above content), and the first source row drops its top border so lines don't double. Matches the reference's `/ SECTION` treatment.
- **Related-card divider goes dashed-bright.** The line between the two cards is `1px dashed --tg-mute` (desktop vertical, stacked horizontal) — the established machinery semantic from the filter bars and metadata rows.

### 2026-07-19 — Mobile/tablet optimization pass (public surface)

**Context**: The v3 public redesign (v5 index + Post v2) shipped desktop-first; the ≤820px experience was a naive collapse. This pass recomposes the public surface for phone/tablet against the Stripe blog (index) and NYT (masthead/menu) mobile references. Desktop is untouched throughout — every change lives inside `@media (max-width: 820px)` / `768px` / `767px` blocks. **The dashboard was not part of this pass.**

**Decisions**:

*News index (≤820px):*
- **Each filter group becomes a horizontal filter bar**: fixed label cell (folder icon + orange title; chevron hidden) | a **dashed-mute** vertical divider | a scrollbar-less horizontally-scrolling item strip. Checkboxes (`.tg-fbox`) hidden; the whole filter block is dialed smaller (labels ~13–14px). The divider is dashed deliberately — the bar is *machinery*, and dashed-mute is the established machinery semantic (post metadata separators), also mirroring the reference's dotted divider. Scoped to `.tg-fgroup-head`; not a general dashed license.
- **Selection = magenta flood, not a font-color change.** Resting items sit in faint gray; the checked item floods `#ff3d97` with an ink-black label — the same hot-magenta as the index rows' hover, so "selected" and "active row" speak one color. (Superseded the first pass's checked-label-turns-orange.) "✕ Clear all" drops below the bars; the `/ Date / Name` head disappears.
- **Rows split by band** (both 26px titles, no ↗ arrow): **tablet (768–820px)** keeps the single-line `date | title | +` grid, one-line ellipsized at the reference density (14px padding, 120px date col, ~43px rows); **phones (<768px)** stack the date kicker above a freely **wrapping** title, `+` spanning both rows. Taller phone rows accepted — readable headlines beat scan density.

*Masthead + navigation:*
- **≤768px masthead flips to a NYT-style bar** (`MobileMasthead`): burger left, fixed-size centered orange wordmark (`clamp(19–25px)`, growing toward the tablet edge), invisible burger mirror right for true centering. The desktop fit-to-width `Wordmark` is `>768px` only.
- The burger opens a **full-screen menu overlay** (`.tg-mobnav`) of stacked Archivo links over hairlines — no search/subsections (we don't have them). **Portaled to `<body>`**: inside the header it was trapped under page content by the frame's `z-index:1` stacking context; the portal carries `tg-surface` so the `--tg-*` tokens still resolve. Closes on tap/✕/Escape/route-change; freezes page scroll while open.
- The burger reads as **quiet chrome, not a control**: muted-gray bars, no frame/fill, brightening to ink on interaction (the `.tg-nav-link` recede→brighten). Rejected a louder framed-orange-flood button — a menu opener shouldn't compete with the wordmark when real navigation is clicking through pages.
- **The desktop bottom nav is hidden ≤768px** (`.tg-bottom-nav`, `!important` over its inline `display:flex`) — the burger menu owns mobile navigation, so it would only duplicate.

*Post page (≤820px):*
- **Hero title clamp floor raised** to `clamp(55–68px)` so the title anchors the page on phone/tablet (the base `clamp(38–110px)` bottomed out too small under the 0.8 page zoom).
- **Reader-expand icon hidden** — the article is already full-width when the sidebar stacks, so the overlay adds nothing. Scoped `:not(.tg-reader-close)` so a reader opened before a resize can still be dismissed.
- Masthead↔"News" top gap tightened (52→28px), via a class on the index wrapper overriding its inline padding.

### 2026-07-18 — Post page v2: hero + metadata sidebar replaces the banded article layout

**Context**: Second import from the Claude Design project ("The Garage AI", page `The Garage AI Post v2.html`), following the v5 homepage. The canvas recomposes the dispatch page around a two-column editorial layout; ported 1:1 into `post-view.tsx` + the post block of `public-theme.css`, with real post data bound in.

**What changed**:
- **Full replace of the article page anatomy.** The breadcrumb band, kicker/summary title block, horizontal metadata strip, and FIG.0 band are gone. New shape: a giant hero title (Archivo 600 @ 100% width, clamp 34–98px), then a `.tg-post` grid — sticky `/ Metadata` sidebar (280–380px) + `/ Article` column (max 820px).
- **The sidebar carries all metadata**: dotted date (orange), author + category tags as **gold chips** (`.tg-meta-chip`, canvas-literal `oklch(0.82 0.17 75)` with a dashed border — a new sanctioned exception, scoped here), read time, and a two-button share row (`.tg-btn` mono ghost → orange flood on hover; the copy-link chip retired). A **mini-title** slides open in the sidebar (grid-rows animation, IntersectionObserver) once the hero scrolls out of view.
- **Reader overlay**: the `/ Article` rule holds a corner-bracket expand button opening a full-screen reader (`.tg-reader`, fixed z-400, blurred backdrop, Escape/backdrop closes) that re-renders the article full-width.
- **Article voice**: 21px Archivo @ 108% ink-soft prose (23.5px `.tg-lede` first paragraph), Archivo 600 @ 102% h2s, orange *underlined* links. Column labels (`/ Metadata`, `/ Article`, seclabels) author at **15.6px** — the home index's effective label size, so the two pages match on screen under the shared 0.8 scale. The `/ Article` rule runs to the column's right edge while its expand icon stays at the prose edge (border-box padding trick). The markdown's leading `# H1` is stripped — the hero owns the title. FIG.0 (the AI cover) sits between the lede and the body inside the article column, 16:9 on ink-black; empty figures hidden ≤720px.
- **Metadata separators are dashed mute** — `1px dashed var(--tg-mute)` under each sidebar row, establishing the semantic: *dashed = metadata key-value machinery, solid hairline = link-row lists*.
- **Sources kept** (not on the canvas — the editorial contract), moved **inside the article column** (same 820px measure, scrolls with the prose) and recomposed as link rows (`.tg-src-row`: dotted date + orange-deep bullet · Archivo 300 title · mono publisher · near-invisible `→` that reads only on the magenta hover flood).
- **Related = a two-up card gallery** (Stripe-blog-inspired, recomposed in our language): `.tg-relcard` pairs a hairline-framed 1:1 cover with a light-Archivo title + inline ↗ (the index glyph), a 4-line-clamped summary, and mono SECTION/FORMAT chips; hovering floods the card's *text* in magenta highlight (`box-decoration-break: clone`) — the text-highlight cousin of the row flood. `PostCard`, `ShareChips`, `.tg-card`, `.tg-share-chip`, `.tg-prose`, and the old solid-orange `.tg-btn`/`.tg-btn-ghost` are deleted; the per-format accent system (`formatAccent`) retired with them — format is a filter now, not a color.
- **Same density calibration as the index**: the whole page runs in `.tg-post-scale` (0.8 zoom + `line-height: normal`), matching the canvas's ~2000px authoring viewport.

**Tradeoffs**: the summary/standfirst no longer renders on the page (it survives as meta description + OG); section/format tokens no longer appear on the post surface (taxonomy is still recorded and filterable from the index); two dead canvas components (a bracketed tab bar, a subscribe band) were deliberately not ported — the canvas's own App never mounts them.

### 2026-07-18 — Homepage v5: the News index replaces the four-band homepage

**Context**: The homepage design was iterated on the Claude Design canvas (project "The Garage AI", page `The Garage AI v5.html`) and imported directly via the Claude Design MCP server — the first handoff using the June-2026 two-way integration rather than a static bundle. v5 is a deliberate reduction: the archive itself becomes the page.

**Decision**: Full replace. The homepage is now a single **News index** (Stripe-blog layout): a giant "News" title with a live superscript count, a sticky left **filter tree** (Format / Section folder groups of checkbox items — multi-select within a group, intersect across groups, all data-driven with live counts), and the full dispatch list as one-line editorial rows (date bullet · title · plus glyph). The four previous bands — hero intro (video + pipeline animation), reading-modes carousel, featured story, dispatch index — were **retired** along with their components, CSS, and the `week-schedule` lib. Format filters wear the reading-mode labels (2-Minute Intel / Go Further / The Week / Start Here).

Accompanying system changes, all from the same canvas (Post v2 shares them — "same as v5"):
- **Palette shift**: `--tg-bg` `#1a1a1a` → `#17191c` (subtle cool tint), `--tg-frame-hair` `#333333` → `#4a4a4a` (hairlines step up in presence), new `--tg-orange-deep` `#b83e02` (row bullets, checked filter boxes).
- **Hot-magenta row hover `#ff3d97`** — the row floods magenta with ink-black content. A deliberate, sanctioned exception to "orange is the only accent," kept pixel-identical to the canvas (confirmed with the operator). A literal, not a token, matching the canvas.
- **Bottom nav simplified**: the boxed-LogoMark panel is dropped; one right-aligned panel with News / About ("News" is home — the index is the news). `logo-mark.tsx` is kept on disk (the brand's only drawn vector; candidates for reuse in the post-page redesign).
- **Title voice**: the News title and row titles run Archivo at **normal width** (100%/104%) and weight 300 for rows — a lighter register than the extended-118% band headings elsewhere.

**Tradeoffs**: The featured/editor's-choice pin loses its public surface (the dashboard pin endpoints still work; the band no longer exists — revisit if a featured slot returns). The hero video and pipeline animation are gone. Homepage sorting is fixed newest-first with no "All" pseudo-filter (unchecked = all). The magenta hover is a brand-rule exception that must not propagate beyond the index rows.

**References**: `frontend/src/components/public/news-index.tsx`, `frontend/src/app/(public)/public-theme.css`, `Design/site-map/public/home/01-news-index.md`, Claude Design project "The Garage AI" → `The Garage AI v5.html`.

### 2026-07-06 — Per-post AI cover images: the locked visual recipe

**Context**: The redesign reserved `.tg-img-slot` frames (16:9 featured, 5:4 card) for real cover art but left them as placeholders. A Phase-0 bake-off explored what those covers should look like.

**Decision**: Each post gets one AI-generated *symbolic* cover — a visual metaphor, not a literal illustration — in a **modern-futurist** flat style: clean minimal geometric forms, smooth flat color, an orange-forward palette (orange the through-line across every cover), generous negative space. Generated by Recraft V4.1 on fal.ai from an art-director prompt. Rendered in the featured + card slots (`object-fit: cover`) with the placeholder as the null fallback, and in the dashboard review panel.

**Rationale / tradeoffs** (full detail in `feature-plans/per-post-image-generation.md`):
- **Style journey**: atomic-age propaganda (accurate to the BioShock/Fallout brainstorm but too heavy/samey) → general retrofuturism → **modern futurist** (leaned cleaner to sit against the sleek dark site without the retro grit clashing). Retro looks are parked in `ALT_STYLES` for a possible future rotation.
- **Anti-sameness**: metaphor *device*, *backdrop*, and *composition* (single / fuse / separate) all rotate per post; a "fewest elements" rule lets a single strong object stand alone rather than always forcing a two-object combo.
- **Object-design law**: man-made subjects render as sleek retrofuturistic devices (not literal antiques), with a simplicity exception so a plain price tag / key / match stays plain and readable.
- **Text is optional and off by default** — a short sarcastic slogan is the primary text tool when a cover earns one, but most covers are symbol-only.
- **Live-site confirmation pending**: how the covers read on the actual dark site is the final judge — to verify once deployed.

### 2026-07-04 — Design/README v3.0: reconciled to the as-built system (two languages, one brand)

**Context**: `Design/README.md` v2.0 (2026-05-17) specified the orange + chamfer + inverted-depth language for **both** surfaces. Reality diverged in two waves it never absorbed: (1) the public surface was completely redesigned from the Claude Design handoff (`design-handoff/`, `feature/public-redesign`) — square corners, `--tg-*` gray ramp, Archivo (extended) + DM Mono, the stage frame / bands / gutter markers / ticker; (2) the dashboard's tokens and typography evolved (accent → `#e85002`, text ramp repointed to the public values, IBM Plex Mono chrome + Archivo editorial split — see the 2026-06-09 entries, one of which explicitly flagged this README reconciliation as outstanding). The stale README was actively misleading: it prescribed Chakra Petch/JetBrains/Inter (all retired), a body grid that was never wired up, chamfers on the public surface (gone), and "no images in the UI" (superseded by the redesign's intentional image slots).

**Decision**: Full rewrite as **v3.0**, structured around the truth that the product runs **two deliberate design languages under one brand**: Surface 1 "the Stage" (public — documented from `public-theme.css` and the built components) and Surface 2 "the Cockpit" (dashboard — the surviving chamfer system with as-built tokens/typography). Documented the shared brand constants (orange `#e85002`, the text ramp, dark-only, mono-chrome/editorial-content split) and the hard scoping rule (`--tg-*`/`.tg-surface` vs `:root`/Tailwind — values copied, never cross-referenced). Page-by-page UI structure moved out to `Design/site-map/` (kept current via `/sync-site-map`) instead of being duplicated in the brief. As-built refinements captured: utility panels (settings cards, featured spotlight, login card) are plain rectangles — the chamfer means "chassis or post". Two pieces of drift found during the audit were cleaned up in the same pass rather than documented: the v2.0 body-grid chassis texture was never actually rendered (only its `--grid`/`--grid-size` tokens existed — removed; the dashboard body is flat `--bg`, and reviving a texture is a new decision, not a revert), and five dead `hero-*` keyframes in `globals.css` (leftovers from a pre-redesign homepage hero; nothing referenced them — verified before deleting, `status-pulse`/`toast-in` are live and stayed).

**Tradeoffs**: The brief no longer contains per-page layout detail — that now lives in `site-map/` (two files to keep current instead of one, mitigated by the `/sync-site-map` skill). The "one visual identity across both surfaces" rationale from the v2.0 entry is formally superseded: the surfaces intentionally diverge in language and converge only on brand constants.

**References**: `Design/README.md` (v3.0), `Design/site-map/`, `design-handoff/REVIEW.md`, `frontend/src/app/(public)/public-theme.css`, `frontend/src/app/globals.css`, `frontend/src/app/layout.tsx`.

### 2026-07-03 — Mobile: masthead top border + ticker border matched to the page side border weight

**Context**: The page side border was thickened 1px → 2px (prior entry, further below). That left the masthead's top border and the ticker band's bottom border — both still at the desktop-inherited 3px — visibly heavier than the 2px side border they meet at the same corners, so the "frame" read as two different weights.

**Decision**: On mobile only (`≤768px`), thinned both to 2px to match: `.tg-masthead-brand` top border 3px → 2px, and a new mobile-only override on `.tg-ticker`'s `border-bottom` (3px → 2px; its base rule is shared with desktop, so the override is scoped to the same media query as the other mobile border rules rather than changed globally). Desktop keeps 3px on both — untouched.

**References**: `frontend/src/app/(public)/public-theme.css` (`.tg-masthead-brand`, `.tg-ticker` mobile overrides).

### 2026-07-03 — Mobile: thin side border runs the full page, not just the masthead

**Context**: The prior entry (below) added thin 1px side borders to just the mobile masthead's wordmark block, on top of the desktop stage frame's 3px left/right/top outline being dropped entirely on mobile for full-bleed (the "Public stage" entry, further below). Operator feedback: bring the outline back down the *whole page*, like the original desktop frame — just thin instead of 3px, so it doesn't cost the content width that full-bleed was solving for.

**Decision**: Moved the side border from `.tg-masthead-brand` up to `.tg-stage-frame` itself (still inside the `≤768px` query, alongside the existing `margin: 0; border: none`): `border-left`/`border-right: 1px solid var(--tg-frame)`. Since `.tg-stage-frame` has no explicit height on mobile (natural document scroll — see the "Public stage" entry) and wraps the masthead, every band, and the footer, the border now spans the entire document height as one continuous line, not just the masthead block. The masthead's own side-border rule was removed (the parent now supplies it at the same pixel edge; keeping both would have doubled the line). No bottom border — matches the desktop frame's own omission; the floating bottom nav is the visual close, not a border.

**References**: `frontend/src/app/(public)/public-theme.css` (`.tg-stage-frame` / `.tg-masthead-brand` mobile overrides).

### 2026-07-03 — Mobile masthead: thin side borders on the wordmark block

**Context**: The mobile masthead (`.tg-masthead-brand`, ≤720px) carries a 3px top border only (see the border-treatment entry below). Operator feedback: the wordmark block reads as unboxed on the sides — add side borders, but visibly thinner than the 3px top rule so they read as a frame detail, not a repeat of the heavy top edge.

**Decision**: `border-left`/`border-right: 1px solid var(--tg-frame)` added to the mobile `.tg-masthead-brand` rule, alongside the existing 3px top border and `border-bottom: none`. Desktop is untouched (the rule lives inside the `≤720px` media query only). **Superseded by the entry above** — the side border now lives on `.tg-stage-frame` and runs the whole page.

**References**: `frontend/src/app/(public)/public-theme.css` (`.tg-masthead-brand` mobile override).

### 2026-07-03 — Mobile: bands drop the gutter, dense sections get mobile-native layouts

**Context**: After the scroll-model split (entry below), the public surface still rendered the *desktop composition* at phone width: every band kept its decorative marker gutter (64px) + right padding (~25% of a 390px screen), the "How do you want to read?" band stacked its four tall preference cards into a full-viewport column (selecting a mode showed no visible result without scrolling), section filter chips wrapped into a tall block, the hero carried a duplicate CTA card, and the empty IMAGE placeholder slots burned whole screens of nothing.

**Decision**: A ≤720px "mobile band collapse" layer in `public-theme.css`, wired through three reusable classes on every gutter-row grid (`.tg-band` / `.tg-band-marker` / `.tg-band-content`): the marker column disappears and content runs flat 20px side padding. Markers that carry meaning re-enter inline via a `.tg-m-only` utility (the dispatch row's `(01)` index joins its meta line); purely decorative ones ((*), (★), (src), the footer LogoMark — the bottom nav already shows it) just go. On top of that, per-section mobile layouts:
- **Reading modes** — the 4-card column becomes a compact 2×2 selector (label + cadence; description and tag are desktop detail, hidden), with hairline separators between the cells (1px grid gap over the frame color; cards get opaque backgrounds on mobile so the line doesn't bleed through their overlay tints). The point: the selector and the posts it filters share one screen. The mode-post grid caps at 2 cards on phones (`nth-child(n+3)` hidden).
- **Section filter chips** — one `nowrap` swipeable row (hidden scrollbar, bleeds to the screen edge so a cut-off chip advertises the scroll) instead of a wrapped block.
- **Hero** — the "latest dispatch" card is hidden on phones (it duplicated the CTA button above it and the `(01)` index row below); stat values 44→32px.
- **Empty IMAGE placeholders** — hidden on mobile (post-card headers, the featured band's 16:9 slot, the article's whole FIG.0 band via `.tg-fig0-band`). They're desktop set-dressing until per-post image generation ships real assets — **revisit these rules when it does**.
- **Article page** — title floor 36→30px (`.tg-post-title`, long headlines were 7+ lines); meta strip gaps tightened.

**Tradeoffs**: The indexed-gutter identity is desktop-only now — accepted; on a phone the gutter is the single most expensive decoration on screen. Mobile hides real content (mode descriptions, 2 of 4 mode posts, the hero card) — deliberate: mobile shows less, better, and the full index is one scroll away. Components keep inline styles for the desktop composition; the mobile layer overrides via classed CSS `!important` rules — the established pattern in this stylesheet.

**References**: `public-theme.css` (mobile band collapse section), `hero-intro.tsx`, `reading-modes.tsx`, `featured-story.tsx`, `dispatch-index.tsx`, `dispatch-row.tsx`, `dispatch-header.tsx`, `sources-list.tsx`, `related-dispatches.tsx`, `public-footer.tsx`, `(public)/page.tsx`, `blog/[slug]/page.tsx`, `about/page.tsx`, `loading.tsx`.

### 2026-07-03 — Public stage: locked viewport on desktop, natural document scroll on mobile

**Context**: The public surface shipped as the handoff's locked-viewport stage — a `100dvh` frame with the masthead pinned and content scrolling *inside* the frame. That's the design's signature on desktop, but on mobile it costs real UX: the browser URL bar can't auto-hide (the document never scrolls), scroll momentum feels stiff, and anchors / find-in-page / tap-status-bar-to-scroll-to-top all assume document scroll. These feed second-order into SEO ranking. Deferred to Phase 4 on Trello; built now on `feature/mobile-optimization`.

**Decision**: A media-query split, implemented as `.tg-stage` / `.tg-stage-frame` / `.tg-stage-scroll` classes in `public-theme.css` (the layout's inline stage styles moved into the stylesheet):
- **> 768px** — unchanged: `100dvh` stage, `overflow: hidden`, masthead pinned, `.tg-stage-scroll` is the scroller.
- **≤ 768px** — the stage becomes `min-height: 100dvh` with no overflow clipping; the document scrolls natively and the masthead scrolls away with it. The fixed bottom nav (Home/About) remains the persistent navigation. The stage frame also goes **full-bleed**: the 3px gray outline and the `--tg-frame-pad` inset are removed (`margin: 0; border: none`) — on a phone the frame is a stage piece that only costs content width; internal band separators (masthead rule, ticker border) stay. **One exception:** the masthead brand block ("THE GARAGE AI") keeps a **top** border on mobile (`.tg-masthead-brand`) so the wordmark still reads as framed at the top of the page. Only the top — no sides (full-bleed) and no bottom: the ticker band directly below carries its own border, so a bottom rule on the wordmark read as a heavy double line; the tonal step from the wordmark's `--tg-bg` to the ticker's `--tg-ink-black` already separates them. The bottom rule was moved from an inline style into `.tg-masthead-brand` (base) so the mobile query can drop it; desktop keeps it.

**Companion mobile fixes in the same change**:
- `viewport` export (`viewportFit: "cover"`) in the root layout + `env(safe-area-inset-bottom)` padding on the bottom nav and the scroll region, so the nav clears the iPhone home indicator.
- The hero's text-protection gradient became `.tg-hero-shade`: left-to-right on desktop (text column left, video visible right), flipped to a darker top-to-bottom wash at ≤860px where the hero stacks into one full-width column.
- Tap targets on coarse pointers (`@media (pointer: coarse)`): share chips 34→42px, filter chips taller, bottom-nav links get padding-extended hit areas.
- Bug fix: three style objects in `dispatch-header.tsx` set `paddingRight` *before* a `padding` shorthand, which silently zeroed the right padding — post breadcrumb/title/meta ran flush into the frame edge on mobile.

**Tradeoffs**:
- On mobile the masthead (wordmark + ticker) scrolls away rather than staying pinned — chosen over a sticky masthead because the fit-to-width wordmark + ticker cost too much vertical space on a phone; the bottom nav already provides persistent navigation.
- Two scroll models to keep in mind when adding public UI: anything that assumes "the scroller is `.tg-stage-scroll`" (e.g. scroll-position JS, scroll-linked effects) must handle the document being the scroller on mobile. Nothing in the current codebase does.

**References**: `frontend/src/app/(public)/layout.tsx`, `frontend/src/app/(public)/public-theme.css` (stage split, hero shade, touch ergonomics), `frontend/src/app/layout.tsx` (viewport export), `frontend/src/components/public/bottom-nav.tsx`, `frontend/src/components/public/hero-intro.tsx`, `frontend/src/components/public/dispatch-header.tsx`.

### 2026-06-09 — Dashboard color ramp: adopt the public surface's exact text + accent values

**Context**: The dashboard's low-emphasis text bottomed out too dark — `--text-secondary #555555` and especially `--text-dim #333333` were nearly invisible against the dark chassis, so keys/labels (e.g. the Status readout's `POSTS PUBLISHED`, `MODE`, …) blended into the background. The public surface already ships a well-tuned neutral ramp (`--tg-ink` / `--tg-mute` / `--tg-faint`) and a brand orange (`--tg-orange`); running two slightly different palettes across the two surfaces was also a needless inconsistency.

**Decision**: Repoint the dashboard's **text and accent token *values*** to the public surface's exact colors, while keeping the dashboard's **structural usage** (its dark chassis) unchanged:
- `--text-primary` `#f0f0f0 → #f9f9f9` (public `--tg-ink`)
- `--text-secondary` `#555555 → #a7a7a7` (public `--tg-mute`)
- `--text-dim` `#333333 → #646464` (public `--tg-faint`)
- `--accent` `#ff6a00 → #e85002` (public `--tg-orange`); `--accent-dim → #c24302`; `--accent-glow`/`--accent-structural` re-based on `232 80 2`. The `pulse-glow` keyframe (sidebar status dot) was updated to match.
- **Unchanged**: backgrounds and structure (`--bg #0a0a0a`, `--structural #000`, `--surface #111`, `--surface-raised`, `--border`, `--border-dim`, `--grid`) stay on the dashboard's dark values — the public surface uses *gray* backgrounds, the dashboard stays *black*. Same colors, different roles. Semantic state colors (`--success`/`--warning`/`--destructive`) also unchanged.

**Rationale**:
- **Legibility** — the faint ramp now clears the chassis (on the darker dashboard the same grays carry *more* contrast than they do on the public gray), so keys/labels read at a glance.
- **One palette, two surfaces** — the brand orange and the text grays are now byte-identical across public and admin; only the background role differs (gray vs black), which is the intended distinction between the two surfaces.
- **Token-level fix** — done in `:root`, so every dashboard label/value/border that references the tokens updates at once; no per-component patching (a grep confirmed no dashboard component hardcodes the old hexes).

**Tradeoffs**:
- **The signature accent shifted** from `#ff6a00` to the slightly redder/darker `#e85002`. Subtle, but it touches every orange element (CTAs, active nav, chamfer cut lines, glow). Deliberate, for cross-surface parity.
- **Values are copied, not referenced** — the public tokens are scoped to `.tg-surface`, so the dashboard can't `var()` them; the hexes are duplicated in `:root` with comments naming their public counterparts. If the public ramp changes, the dashboard must be updated in step.

**References**: `frontend/src/app/globals.css` (`:root` text + accent tokens, `pulse-glow` keyframe), `frontend/src/app/(public)/public-theme.css` (`--tg-*` source values), `Design/README.md` (color token table + accent prose).

### 2026-06-09 — Dashboard typeface split: IBM Plex Mono chrome, Archivo for post content

**Context**: The dashboard chrome ran on JetBrains Mono (mono) + Fraunces (display) + Inter (body). The operator wanted the admin surface to read more like a command console, and to draw a clear line between *the tool* and *the content the tool manages*: a post in the queue is the same editorial artifact that will live on the public site, so it should look like it — while everything that is dashboard machinery should read as machinery.

**Decision**: Two voices on the dashboard, by what the text *is*:
- **IBM Plex Mono — all dashboard chrome.** Nav, labels, stat values, page titles, buttons, dates, eval badges, taxonomy/tags, settings. The global Tailwind tokens `--font-sans` / `--font-mono` / `--font-display` all resolve to IBM Plex Mono (`globals.css` `@theme inline`), so chrome is IBM Plex by default with no per-component opt-in.
- **Archivo (`--font-editorial`) — post content only.** Card titles + summaries (queue, published, scheduled, featured spotlight), plus the review-panel post title and the rendered markdown preview. This is the public site's display/body grotesque, so a post reads the same in the queue as it will once published.

Code `dropped` JetBrains Mono, Fraunces, and Inter entirely — after the repoint nothing referenced them (the public surface uses its own `--tg-*` Archivo/DM Mono tokens), so they were unused webfont loads.

**Rationale**:
- **Type encodes provenance.** The chrome/content split is the same idea as the color/depth hierarchy — the operator can tell at a glance what belongs to the product vs. what belongs to the public site. Monospace chrome + grotesque content makes that legible without a label.
- **IBM Plex Mono is the "operations console" read** — colder and more systems-flavored than JetBrains Mono's friendlier terminals, fitting the fighter-jet-HUD/command-center direction for the admin surface.
- **Default-by-token, not per-component.** Repointing the theme tokens means chrome is correct everywhere automatically; only post content carries the explicit `font-editorial` class. Fewer places to drift.
- **The public surface is untouched** — it lives inside `.tg-surface` and uses inline `--tg-*` tokens (zero Tailwind `font-*` utilities), so repointing the global tokens can't reach it.

**Tradeoffs**:
- **Body prose on the dashboard is now monospace** (settings descriptions, empty states) — deliberate per "everything else is chrome," but long sentences in mono read more technical/less warm. Acceptable for a single-operator console; revisit if a prose-heavy surface appears.
- **Archivo runs at normal width here**, not the EXTENDED (`wdth`) treatment the public hero uses — extended titles would overflow/awkwardly wrap in the compact card rows. So "same font," not "identical treatment," as the public surface.
- **`Design/README.md`'s Typography section is now doubly stale** — it still names Chakra Petch / JetBrains Mono / Inter, which predates *both* the public Archivo/DM Mono redesign and this change. A full reconciliation of that section is still outstanding.

**References**: `frontend/src/app/globals.css` (`--font-editorial`, repointed `--font-sans/mono/display`), `frontend/src/app/layout.tsx` (IBM Plex Mono load; Inter/Fraunces/JetBrains removed), card components (`queue-card`, `published-row`, `scheduled-card`, `featured-spotlight`), `review-panel.tsx`, `markdown-body.tsx`.

### 2026-06-06 — Public index filter: browse by Section, data-driven pills (was: legacy tag list)

**Context**: The homepage filter shipped as a hardcoded list of the legacy 7 tags (`Voice AI`, `CRM`, `Merchandising`, `Industry Move`, …), filtering by `post.tags`. After the v2 taxonomy landed, this drifted: `Industry Move` became a `story_type` (not a tag), the fine tags were never meant to be navigation, and the list was a static thing to maintain. The v2 taxonomy explicitly says readers should **browse at the Section level**, and warns against shipping empty/fine-grained filter buckets at low post volume.

**Decision**: The public index now filters by **`section`** (the v2 primary nav axis), and the filter pills are **derived from the sections present in the loaded posts** — `ALL` plus each distinct `post.section`, sorted — not a hardcoded list. A section pill appears only once a post carries that section. The pill visual is unchanged (6px quad-chamfer Tier 2, accent active state). Fine `tags` remain on the post cards as labels, but are no longer a navigation axis. (Required exposing `section` on the public API list shape.)

**Rationale**:
- **Section is the right altitude for navigation** — broad, stable, one-per-post, and meaningful to a reader scanning the index; the fine tags fragment into dead-end buckets at ~3 posts/week (the v2 "vocabulary, not navigation" principle).
- **Data-driven pills eliminate dead buckets by construction** — no empty `Industry Move` pill, nothing to maintain as sections graduate; the filter always reflects what's actually published. Directly implements the "don't ship empty filters" guidance.
- **Tags stay as card labels** — they still add fine-grained context on each card without pretending to be browsable.

**Tradeoffs**:
- **The visible filter set varies with content** — early on, only a couple of section pills show. That's intended (better than empty buckets), but it means the nav isn't a fixed, predictable set until the catalog fills out.
- **Doesn't yet surface Format or Story-Type as browse axes** — those remain admin-only dataset values for now (a deliberate hold per the v2 Index Types plan); the public site stays single-axis (Section) + the date feed.
- **Legacy tag/`tags` vocabulary is still what generation emits** — reconciling the tag vocabulary to the new nested tags is a separate, still-deferred backend change; this decision only moves *navigation* to sections.

### 2026-05-19 — Data cards: expose all related data through a value hierarchy

**Context**: The original stat card spec showed a label and a primary value. For time-based cards (Last Run, Next Run), a single value ("2 DAYS AGO" or "MON MAY 18") is incomplete — it loses the complementary dimension of the data (the exact timestamp for a relative value, or the countdown for a future one). An operator glancing at the dashboard needs to answer different questions at different speeds.

**Decision**: Data cards expose related information through three optional slots, in descending visual weight:
- **Primary value** — the most scannable datum (e.g. `2 DAYS AGO`, `MON MAY 18`). Large, bold, center-dominant.
- **Sub-line** — the complementary dimension (e.g. exact date + time for Last Run; time + countdown for Next Run). 10px JetBrains Mono, `--text-muted`. Activated cards use `--accent` on sub-lines.
- **Footer** — persistent context that doesn't change with live data (e.g. `Cadence — Mon · Thu · 08:00` on the Next Run card). 10px JetBrains Mono, `--text-dim`. Used sparingly.

If a slot has no meaningful data, omit it — don't fill it with placeholders. The rule is: if the data exists and is related, show it.

**Rationale**: Empty slots cost nothing; hiding available data costs the operator a navigation step or a mental approximation. A relative timestamp ("2 days ago") and an absolute timestamp ("MON MAY 18 · 08:00") answer different questions — both are useful in the same glance. Layering them in a clear typographic hierarchy keeps the primary value fast to scan while the detail is there for the slower read.

**Tradeoffs**: Cards can look dense if all three slots carry long strings. Mitigation: use concise machine formats (`MON MAY 18`, `IN 2 DAYS`, `08:00`). The sub-line and footer are both 10px mono — they stay subordinate regardless of content length.

**References**: `frontend/src/components/dashboard/overview/stat-card.tsx` (`value`, `subLine`, `footer` props), `frontend/src/lib/utils.ts` (`formatRelativeFuture`)

---

### 2026-05-19 — Dashboard section headers: `//` index + label + horizontal rule

**Context**: As dashboard pages gain more than one distinct group of content (Overview now has Status and Quick Actions), a visual pattern is needed to separate and name sections without adding heavy structural chrome.

**Decision**: Dashboard content sections are labeled with a `SectionHeader` component:
- A JetBrains Mono all-caps label: a zero-padded counter (`// 01`) in `--accent` followed by the section name in `--text-secondary`.
- A full-width `--border-dim` horizontal rule that extends from the label to the right edge — creating a terminal-readout separator.
- Consistent vertical spacing above and below.

The pattern lives in `frontend/src/components/dashboard/section-header.tsx`.

**Rationale**: The `//` prefix for section identifiers is already established in the design language — the public homepage uses `// COVER STORY` and `// THE INDEX` with the same monospaced all-caps treatment. Extending it to the dashboard content sections creates a consistent section-naming idiom across both surfaces. The horizontal rule extends from the label like a terminal separator, which is consistent with how horizontal rules are already used in the hero readout. No additional chrome (no background fill, no card border) — just type and a line.

**Tradeoffs**: The zero-padded counter (`01`, `02`) implies a fixed order. If sections on a page become reordered or conditional, the numbers should be reviewed. For MVP all dashboard pages have fixed section order, so this is fine.

**References**: `frontend/src/components/dashboard/section-header.tsx`, `frontend/src/components/dashboard/overview/overview-client.tsx`

---

### 2026-05-19 — Body grid: changed from orange @ 6% to near-blend gray (`#141414`)

**Context**: The body grid was originally orange at 6% opacity, specified as the chassis-surface texture that makes the recessed pure-black structural panels read as cuts into the body rather than boxes stacked on top. In practice, the faint orange tint bled slightly into transition areas between the body and panels, adding a warm cast that competed with intentional orange use (structural borders, chamfer lines, CTAs, active states). The grid's role is textural and structural — it signals "chassis surface" — not coloristic.

**Decision**: `--grid` changed from `rgba(255, 106, 0, 0.06)` to `#141414`. A near-blend gray (slightly lighter than the `#0a0a0a` body) produces the same 48px grid-line chassis texture without any orange tint. Also added `background-position: 24px 24px` to center the grid visually rather than starting lines at the viewport edge.

**Rationale**: Orange should be load-bearing — its presence marks structure, active states, and CTAs. A faint orange grid across the entire page dilutes that signal. The chassis texture reading is preserved by the gray grid because the depth cue comes from the contrast between the textured body and the pure-black recesses — not from the grid color itself.

**Tradeoffs**: The chassis texture is subtler with gray. If it reads as invisible on certain monitors (especially high-brightness OLED), increasing the gray slightly (e.g. `#1a1a1a`) is the first lever. The `background-position` offset is a visual preference with no structural consequence — revert it independently if needed.

**References**: `frontend/src/app/globals.css` (`--grid` token, `body` background rules)

---

### 2026-05-18 — Dashboard: locked viewport, fixed route header, scrollable content only
**Context**: While testing `/dashboard/published` against real data (16+ post cards), the whole window scrolled as soon as content overflowed the viewport. The sidebar slid up out of view, the main shell's top-right chamfer scrolled off, and the route title (`Published Posts`) disappeared with the content. The dashboard "lost its frame" — what's meant to read as an operational cockpit started reading like a long blog page that happened to have a sidebar.

The root cause was layering of `min-h-*` constraints in `dashboard/layout.tsx`: the outer flex row, the main `ChamferedPanel`, and the inner scroll wrapper all used `min-h-screen` / `min-h-[calc(100vh-1.5rem)]`, which permits growth. When children overflowed, every container grew, body scrolled, and the inner `overflow-y-auto` never engaged because its parent was never bounded.
**Decision**: The dashboard surface is a **locked-viewport cockpit**, not a scrolling page. Codified as a hard rule:
- The dashboard wrapper is `h-screen overflow-hidden` — body cannot scroll.
- The main `ChamferedPanel` is `h-[calc(100vh-1.5rem)] overflow-hidden` — bounded, never grows.
- Inside the shell, the page label + title are **fixed**. Only the region below them scrolls.
- All five dashboard routes (Overview, Queue, Scheduled, Published, Settings) render through a shared `DashboardPageShell` component at `frontend/src/components/dashboard/page-shell.tsx` so the behavior cannot drift per-route.
- No top fade / gradient mask on the scroll area. (Tried; the operator preferred a clean cut.)

`Design/README.md` updated under "Layout: Admin Dashboard Shell → Scroll behavior" with the same rule, so every future dashboard feature inherits it from the spec.
**Rationale**: The chamfered shell + Tier 1 orange borders are doing visual work — they read as load-bearing chassis. If the chassis scrolls away, the metaphor breaks: the user is no longer "inside the cockpit" looking at a panel of data, they're scrolling past a graphic. Pinning the chassis preserves the inverted-depth reading (cards sit on a recessed shell inside a body chassis) regardless of content length. And pinning the route title means the user always knows *which* dashboard surface they're on while scanning a long list — important for the Published archive, which will grow indefinitely.

Putting the implementation in a single shared component (`DashboardPageShell`) instead of duplicating the pattern in every `page.tsx` makes the rule enforceable: a future feature has to actively bypass the shell to break it, which a code review will catch.
**Tradeoffs**:
- **Nested scroll containers can feel unusual on trackpad/scroll-wheel** if the user expects the outer page to scroll. Mitigated because the dashboard has clear inner boundaries (the chamfered shell is visually distinct from the body chassis) — there's no ambiguity about *where* scroll should happen.
- **No top fade.** A fade was prototyped (gradient from `--structural` to transparent over 24px) so content "dissolved" into the fixed title bar rather than clipping. The operator chose the clean cut — closer to the HUD/terminal feel, and avoids the fade slightly dimming the first card at rest.
- **Mobile considerations.** The shell still works on mobile (sidebar collapses to a drawer; main shell + scroll region remain). But mobile browsers have address-bar resize behavior that can make `100vh` jumpy. If this becomes a problem, switch the wrapper to `100dvh` (dynamic viewport height) — flagged here so a future fix can do it without re-litigating the design.
- **Cannot add a page that needs the viewport to scroll.** This is intentional — but worth naming so it's not surprising. If a future dashboard route needs page-level scroll (e.g. a long-form editor), it must be designed as a modal/full-page overlay outside the dashboard shell, not as a route that bypasses `DashboardPageShell`.
**References**:
- Implementation: `frontend/src/components/dashboard/page-shell.tsx`, `frontend/src/app/dashboard/layout.tsx`
- Spec: `Design/README.md` → "Layout: Admin Dashboard Shell → Main content area → Scroll behavior"
- Commit: `0c3b2f7` — design: lock dashboard viewport and pin route header

### 2026-05-17 — Design language v2.0: orange + chamfered geometry + inverted-depth chassis (both surfaces)
**Context**: Phase 3 (Admin UI) kickoff. Before building the dashboard shell, the operator delivered a new design language spec (`~/Desktop/delorean-design-language.html`) that materially overhauls the visual system. The v1 spec in `Design/README.md` was blue-accent with top-left bracket marks (`⌐`), Inter 800/900 display titles, and a homepage-hero grid that faded in at the bottom quarter. The v2 HTML covers only the admin dashboard; the operator confirmed v2 should also extend to the public blog (single visual identity across both surfaces).
**Decision**: Rewrite `Design/README.md` to v2.0, covering both surfaces. Key changes:
- **Accent**: blue `#1a3fff` → **orange `#ff6a00`**. Single accent across the whole product.
- **Depth model — inverted layering**: body `#0a0a0a` carries an orange grid @ 6%, structural shell (sidebar + main) is pure `#000` (darker than body, *recessed* into chassis), cards are `#111` (lifted above shell), hover is `#181818`. Conventional dark-UI layering is intentionally inverted.
- **Chamfer geometry — the new signature**: every shape uses a 45° corner cut via `clip-path` (real cuts, not painted lines). No `border-radius` anywhere. Sizes scale with hierarchy: 6px tags / 12px buttons / 16px cards / 20px shell. Patterns: SINGLE (TL only — content panels), DUAL (TL+BR — interactive + structural), QUAD (all four — chips). Stacked panels tessellate at the same cut angle.
- **Two-tier border system**: Tier 1 Structural = full orange perimeter @ 40% + ~70% on cut lines (sidebar, main shell, full-page modals). Tier 2 Component = dark `#222` perimeter + solid orange ONLY on cut lines (cards, buttons, tags, inputs).
- **Typography**: display titles move from Inter 800/900 → **Chakra Petch 700** sitewide. JetBrains Mono retained for chrome. Inter 400 retained for body. Inter 900 retained for stat-card values only.
- **Brackets `⌐` removed entirely**, replaced by the chamfer cut + accent diagonal line. Left accent bar on post cards survives.
- **Body grid is permanent and uniform** (orange @ 6%, 48px cells, no mask). The v1 "grid fades in at bottom of hero" behavior is dropped.
- **Glow orb survives in orange** (`--accent-glow` @ 12%) on homepage + about hero only. Not used in the dashboard.
- Semantic colors added: `--success #00c47d`, `--warning #ff9a40`, `--destructive #e03434`.

The v2 HTML spec remains on the operator's Desktop as the artistic reference; `Design/README.md` is the canonical dev-facing source of truth and the file CLAUDE.md instructs every UI feature to read first.
**Rationale**: The v1 language read as "premium editorial blog" — fine for the public surface, but too soft for an operational command-center dashboard. The orange + chamfer + inverted-depth direction lands closer to the actual product brief (a private pipeline cockpit + a public dispatch feed). One visual identity across both surfaces avoids the "two products glued together" feel — the public blog reads as the public face of the same machine the admin is operating. Chakra Petch as the display face is more retrofuturist than Inter heavy weights, which fits the DeLorean retrofuturism conceit. The chamfer system is the load-bearing visual idea: it gives every component a consistent corner signature, makes hierarchy legible at a glance (cut size = component class), and creates the "real cuts in the chassis" reading that the inverted-depth model depends on.

Timing matters — making this change *before* Phase 3 means zero re-work cost. After the dashboard shell ships under v1 tokens, every future feature would inherit the wrong visual base.
**Tradeoffs**:
- **Implementation cost.** Chamfered borders aren't free in Tailwind. `clip-path` clips the *fill* but doesn't stroke the clipped edge — so every chamfered element needs a paired SVG overlay (or a layered clipped element) to render the dark perimeter + orange cut line. Mitigation: build a single `<ChamferedPanel>` primitive up front and reuse. README documents the pattern with a worked example.
- **`globals.css` is now stale.** Current tokens are v1 (blue accent, no `--structural` / `--surface-raised` / `--text-dim` / `--grid` / semantic colors). Migrating `globals.css` to v2 tokens + adding Chakra Petch to `next/font` loading is a separate task — must land before or inside the `dashboard-shell-and-overview` feature plan, not after.
- **One extra Google Font.** Chakra Petch adds a third family. Mitigated by loading only the weights actually used (500/600/700) and using `display=swap`.
- **Public blog re-skin is implicit.** The Phase 4 public-blog features (`public-shell-and-homepage`, `post-page`, `about-page`) inherit v2; any mocks the operator may have in mind for the blog should be re-validated against this README before those features start.
- **No light theme, ever.** Already a v1 constraint; v2 doubles down. If a future requirement ever needs a light surface, it's not a config flip — it's a new design language.
**References**:
- v2 artistic spec: `~/Desktop/delorean-design-language.html`
- v2 dev spec: `Design/README.md` (canonical, applies to both surfaces)
