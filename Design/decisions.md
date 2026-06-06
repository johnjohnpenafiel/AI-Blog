# DeLorean — Design Decision Log

> Visual-design decisions with their full context, rationale, and tradeoffs. Separated from `PLANNING-decisions.md` so design concerns stay independent from architecture/product concerns. Read this file when you need to know *why* a past visual choice was made.
>
> The current visual spec lives in `Design/README.md` — this file captures *changes* to that spec over time.

New entries at the top.

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
