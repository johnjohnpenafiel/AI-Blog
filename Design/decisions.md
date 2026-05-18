# DeLorean — Design Decision Log

> Visual-design decisions with their full context, rationale, and tradeoffs. Separated from `PLANNING-decisions.md` so design concerns stay independent from architecture/product concerns. Read this file when you need to know *why* a past visual choice was made.
>
> The current visual spec lives in `Design/README.md` — this file captures *changes* to that spec over time.

New entries at the top.

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
