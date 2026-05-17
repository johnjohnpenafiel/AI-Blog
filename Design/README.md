# DeLorean — UI Design Brief (v2.0)

> **v2.0 — May 2026.** Major language overhaul: orange accent on inverted-depth chassis, Chakra Petch display type, chamfered geometry as the signature visual system, and a two-tier border hierarchy. Applies to **both surfaces** (public blog + admin dashboard).
>
> Companion file: `Desktop/delorean-design-language.html` is the visual spec sheet for the admin dashboard. This README is the dev-facing source of truth and extends the language across the public blog.

## What Is DeLorean

DeLorean is an automated twice-weekly blog covering AI and operational technology developments in the automotive industry. It has two surfaces:

- **Public Blog (DeLorean)** — where readers discover and read posts
- **Admin Dashboard** — where a single operator manages the publishing pipeline

This document defines the visual design direction and page-by-page UI structure for both surfaces. Use this as the source of truth when building or designing any UI component.

---

## Design System

### Aesthetic Direction

Dark operational command-center, retrofuturist Tron. The chassis is matte black with a faint orange grid; major structural panels (sidebar, main shell) are **recessed cuts** into the chassis rather than boxes stacked on top. Every shape — cards, buttons, tags, inputs — has a chamfered corner with an orange diagonal cut line; this is the signature element of the language. UI chrome is monospaced and terminal-flavored; article body text stays clean and readable.

The reference feeling: a premium engineering publication crossed with a fighter-jet HUD. Intentional, controlled, cinematic. Orange is the only accent, used sparingly to mark structure, active states, and CTAs.

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0a0a0a` | Body / page background. Carries the orange grid overlay. |
| `--structural` | `#000000` | Sidebar + main dashboard shell. Pure black. Reads as recessed into the body. |
| `--surface` | `#111111` | Cards, content panels, post cards. Lifted above the structural shell. |
| `--surface-raised` | `#181818` | Hover state on cards. Elevated further. |
| `--border` | `#222222` | Default solid borders. Never dashed. |
| `--border-dim` | `#1a1a1a` | Subtle dividers — section separators, internal table rules. |
| `--text-primary` | `#f0f0f0` | Headings, body text, primary values. |
| `--text-secondary` | `#555555` | Metadata, dates, inactive nav, muted labels. |
| `--text-dim` | `#333333` | Lowest-emphasis chrome — corner markers, fine print. |
| `--accent` | `#ff6a00` | The only accent. Active states, CTAs, chamfer cut lines, glow. |
| `--accent-dim` | `#cc5500` | Hover on orange elements. |
| `--accent-glow` | `rgba(255, 106, 0, 0.12)` | Soft orange tint behind active nav items and hero atmosphere. |
| `--accent-structural` | `rgba(255, 106, 0, 0.40)` | Tier 1 structural borders (sidebar, main shell). |
| `--grid` | `rgba(255, 106, 0, 0.06)` | Body grid overlay color. 48px cells. |

**Semantic colors** (use sparingly — only for state, never decoration):

| Token | Value | Usage |
|---|---|---|
| `--success` | `#00c47d` | Published state, success toasts, ✓ markers. |
| `--warning` | `#ff9a40` | Warnings, pending states. |
| `--destructive` | `#e03434` | Errors, reject/delete confirmations. |

### Depth Hierarchy (Inverted Layering)

DeLorean **inverts conventional dark UI layering.** Most dark interfaces make cards *lighter* than the body to feel raised. Here, the major structural panels (sidebar, main shell) are **pure black — darker than the body** — so they read as **recessed cuts into the chassis** rather than panels stacked on top. The body itself carries a faint orange grid that gives texture to the chassis surface, making the pure-black recesses feel cleaner and more deliberate by contrast.

Four layers, back-to-front:

1. **Body** `#0a0a0a` + orange grid @ 6% — the chassis surface (texture layer)
2. **Structural** `#000000` — sidebar, main shell, full-page modal panels (recessed into body)
3. **Cards** `#111111` — stat panels, post cards, review panels (lifted above shell)
4. **Raised** `#181818` — hover / active states on cards (elevated further)

The reading: **cards sit on top of the structural shell, which is recessed into the body chassis.** This three-tier depth model gives every UI element a clear position in the visual hierarchy. The orange chamfer cuts on the structural shell feel like real cuts through the chassis, not painted edges.

### Typography

| Role | Font | Style |
|---|---|---|
| UI chrome — nav, labels, tags, metadata, buttons | **JetBrains Mono** 400 / 700 | 10–11px, all-caps, 0.2em letter-spacing |
| Display titles — wordmark, hero, page titles, section headings | **Chakra Petch** 700 (600 for smaller headings) | 22–56px, line-height 1.0–1.1, 0.02em letter-spacing. Two-tone treatment allowed (white + accent). |
| Body / article text | **Inter** 400 | 14–18px, line-height 1.7. Comfortable reading. Never monospaced. |
| Large stat values | **Inter** 900 | 36–56px, line-height 1. Used on stat cards. Switches to `--accent` when emphasized. |

**Typography rules:**
- All display titles sitewide use **Chakra Petch 700** — hero, post titles, section headings, about-page display text. One typographic identity across both surfaces.
- No serif fonts anywhere.
- Inter is body-only and stat-value-only. Never use Inter for display titles (that's Chakra Petch's job).
- All chrome text is uppercase with tight tracking.

### Chamfer Geometry — The Signature

**Every shape in the UI uses chamfered (clipped) corners** — a 45° diagonal cut replacing what would otherwise be a right-angle corner. **No rounded corners (`border-radius`) anywhere.** The orange diagonal line on the cut edge is the signature visual element of DeLorean.

**Cut sizes** scale with component hierarchy:

| Size | Components |
|---|---|
| **6px** | Tags, badges, input fields, semantic chips |
| **12px** | Buttons |
| **16px** | Cards, stat panels, post cards, review panels |
| **20px** | Sidebar, main shell, full-page modals |

**Cut patterns:**

| Pattern | Where | Notes |
|---|---|---|
| **SINGLE** — top-left only | Content panels (cards, stat cards, post cards) | Bottom-right stays square. Reads as "content." |
| **DUAL** — top-left + bottom-right (opposite corners) | Buttons, structural shells | Diagonal feel — top-right + bottom-left stay square. Reads as "interactive" or "structural." |
| **QUAD** — all four corners | Tags, badges, inputs | Smallest cut (6–8px). Reads as "chip." |

**Two non-negotiable rules:**

1. **True 45° angle.** The horizontal and vertical offset of each chamfer must be equal. A 20px chamfer is 20px in horizontally *and* 20px in vertically. Unequal offsets produce steep, almost-vertical slashes that read as aggressive cuts rather than calm Tron geometry. *Sanity check: the slope of the cut should match the slope of a "/" in monospace.*

2. **Real cuts, not painted lines.** The chamfer must be a real cut through the shape's geometry — implemented with `clip-path` (or an SVG polygon) — never an orange line painted over a hidden black corner. Because the body has a grid texture and panels sit on different colored layers, painted-line fakery breaks visibly.

**Tessellation:** when two panels stack vertically, the bottom-right cut of the upper panel echoes the top-left cut of the lower panel at the same angle. The diagonals never touch — a gap separates them — but the shared angle makes panels read as interlocking armor plating.

### Border Hierarchy

Borders signal hierarchy. There are **two tiers**, and the distinction is what makes the UI feel architected rather than decorated. Orange is the structural language: where it appears defines what is *load-bearing* versus what is *contained within.*

**Tier 1 — Structural Borders**
- **Full perimeter orange at 40% opacity** (`--accent-structural`)
- Chamfer cut lines brighter (~70% opacity) for emphasis
- Applies to: sidebar, main dashboard shell, full-page modal panels
- Reads as: the architectural skeleton — the walls of the room

**Tier 2 — Component Borders**
- **Dark perimeter** `#222` (`--border`)
- **Orange ONLY on the chamfer cut lines** (solid `--accent`)
- Applies to: stat cards, post cards, buttons, tags, inputs, review panels
- Reads as: contents of the room — furniture inside the architecture

The two tiers always nest. Structural orange defines the room; component borders define the furniture.

### Decorative Elements

- **Body grid overlay** — orange at 6% opacity, 48px cells, 1px lines. Runs continuously across the entire page on both surfaces. CSS: two `linear-gradient` backgrounds stacked, no mask required.
- **Left accent vertical bar** — 2–3px solid `--accent` bar on the left edge of post cards and active sidebar items. Visual anchor and "selected" indicator.
- **Orange diagonal cut line** — the chamfer signature. 1.5–2px stroke on every clipped corner. Tier 1 cuts run at 70% opacity; Tier 2 cuts run at 100%.
- **Orange radial glow** — large blurred circle in `--accent-glow`, used as atmospheric background on the homepage hero and about-page hero only. Implemented as a CSS `radial-gradient` or blurred `div` — not an image.
- **Horizontal rule lines** — `1px solid --border-dim` for section separators and the terminal-readout treatment inside the homepage hero.
- **Monospaced all-caps chrome** — every label, tag, button, and piece of metadata. Never used for article body text.
- **Two-tone titles** — selective: hero titles, key display headings. Primary words in `--text-primary`, key terms in `--accent`. Applied to emphasize, not globally.

### Rules

| ✓ DO | ✗ NEVER |
|---|---|
| Chamfered corners via `clip-path` (real cuts) | Rounded corners (`border-radius`) anywhere |
| True 45° angles — equal H + V offset | Painted orange lines over hidden corners |
| Single dark theme — no light mode, no toggle | Unequal chamfer offsets (steep slashes) |
| Orange `#FF6A00` as the only accent | Cut lines extending past `clip-path` edges |
| Chakra Petch 700 for all display titles | Circular or oval shapes |
| JetBrains Mono for all UI chrome | Gradients (exception: subtle orange glow) |
| Inter 400 for body text only | Any accent color other than `#FF6A00` |
| Body grid: orange @ 6%, 48px cell | Photography or images in the UI |
| Sidebar + main shell: pure `#000` (recessed) | Serif fonts |
| Cards: `#111` (lifted above shell) | Inter for display titles (use Chakra Petch) |
| Tessellating chamfer angles on stacked panels | Top-left brackets `⌐` (replaced by chamfer cut) |

---

## Surface 1 — Public Blog (DeLorean)

### Page: `/` — Homepage

**Nav (sticky)**
- Left: `DELOREAN` wordmark in Chakra Petch 700, small (16–18px). Two-tone treatment optional (`DE` `LOR` `EAN` with middle three letters in `--accent`).
- Right: `BLOG` and `ABOUT` text links in JetBrains Mono, all-caps
- Background: `--bg` (transparent over the grid) with `--border-dim` bottom border on scroll

**Hero / Cover Story**
- Full-width section, cinematic height (~80–90vh)
- **Background layers (bottom to top):**
  1. Body chassis: `--bg` with continuous orange grid (already present from the body — no per-section grid behavior)
  2. **Orange radial glow orb** — large, soft, atmospheric. `--accent-glow` (orange @ 12%), heavily blurred, positioned offset behind the title block.
- **Content composition:**
  - Thin full-width horizontal rule (`--border-dim`) above the label row — terminal separator
  - **Label row** (full width, two sides):
    - Left: `// COVER STORY` + dash line + `ISSUE 04 · MAY 2026` — JetBrains Mono, all-caps, `--text-secondary`. Section-number style: `// 04` in `--accent` at small size, like the design spec's section headers.
    - Right: `● LIVE FEED` — `--accent` dot + JetBrains Mono label
  - **Title** — Chakra Petch 700, 48–72px, 2–3 lines. **Two-tone treatment:** primary words in `--text-primary`, key terms (e.g. "AI and technology", "automotive") in `--accent`. Dominant, full-width.
  - Thin full-width horizontal rule below the title
  - 1-line summary — JetBrains Mono, `--text-secondary`, all-caps
  - Tag pill(s) + read time — JetBrains Mono, right-aligned on the same row
  - CTA button: `READ STORY →` — Tier 2 component border treatment: 12px dual-chamfer, transparent background, `--accent` outline, `--accent` text. Hover: `--accent-dim`.
  - Author + date line below CTA: e.g. `MARCO LENZ · MAY 6, 2026` — JetBrains Mono, `--text-secondary`
- **Structural framing:** two thin horizontal rules isolate the content block like a terminal readout
- No card chrome on the hero — framing is done through lines + glow, not a clipped panel

**Tag Filter**
- Sits between hero and posts grid
- 6px quad-chamfer pill tags (Tier 2 component): `ALL` `VOICE AI` `CRM` `PRICING & ANALYTICS` `MERCHANDISING` `SALES DEV` `OT & INFRASTRUCTURE` `INDUSTRY MOVE`
- Default active: `ALL`
- Active state: `--accent` border perimeter, `--accent-glow` background tint, `--accent` text
- Inactive: `--border` perimeter, orange ONLY on the chamfer cut lines, `--text-secondary` text
- Filters the posts grid below in real time (no page reload)

**Index Section Header**
- Label row: `// THE INDEX` + dash line + `[n] TRANSMISSIONS` — JetBrains Mono, all-caps, `--text-secondary`. Count updates dynamically.
- Section heading: `Latest dispatches` — Chakra Petch 700, large, same display family as the hero
- `VIEW ARCHIVE →` — right-aligned, JetBrains Mono, `--text-secondary`. Links to full archive (future feature, render as inactive for MVP if needed)

**Post Cards (Index)**
- Full-width rows — single column, not a 2-column grid
- Each card is a **Tier 2 component**: `--surface` (`#111`) background, 16px single top-left chamfer, `--border` perimeter, orange diagonal on the cut line
- **Left accent vertical bar** — 2–3px solid `--accent` bar on the left edge of the card, runs full card height (starts below the chamfer). Visual anchor and category indicator.
- Top row: tag pill (6px quad-chamfer) left — publish date (`MAY 04, 2026` format) right
- Post title — Chakra Petch 700, dominant
- 1-line summary — Inter 400, `--text-secondary`
- Bottom row: read time left — `READ →` right (`--accent`)
- Hover: card background lifts to `--surface-raised`
- Empty state: `// NO TRANSMISSIONS FOUND` in JetBrains Mono `--text-dim`

**Footer**
- `DELOREAN` wordmark left (Chakra Petch 700)
- Tagline: `THE PULSE OF AI AND TECHNOLOGY RESHAPING THE AUTOMOTIVE INDUSTRY` (JetBrains Mono, `--text-secondary`)
- Links: `BLOG` `ABOUT` right-aligned
- Top border `--border-dim`, minimal padding

---

### Page: `/blog/[slug]` — Individual Post

**Nav** — same sticky nav as homepage

**Post Header**
- Large Chakra Petch 700 title (full width, editorial scale)
- Row of metadata below title (JetBrains Mono, `--text-secondary`):
  - Publish date
  - Read time
  - Tag pill(s)
- Thin `--border-dim` separator line below header

**Body**
- Clean rendered markdown
- Comfortable reading width (~680px max, centered)
- Font: **Inter 400**, 18px, 1.7 line height — `--text-primary` for body, slightly muted for inline secondary content
- Headings in **Chakra Petch 600/700**
- Code blocks (if any): JetBrains Mono, `--surface` background, 6px quad chamfer, `--border` perimeter with orange cut lines
- No sidebar, no distractions

**Share Bar**
- Positioned below the body, above sources
- Label: `SHARE THIS POST →` in JetBrains Mono all-caps
- Three buttons (12px dual-chamfer, Tier 2 outline style): `X` `LINKEDIN` `COPY LINK`
- `--accent` on hover (text + cut lines)
- Copy link shows brief `COPIED ✓` confirmation state in `--success`

**Sources**
- Collapsible section below share bar
- Header: `SOURCES [n]` — JetBrains Mono, all-caps, `--text-secondary`
- Expanded: list of sources, each showing:
  - Article title (linked, `--accent`)
  - Publisher name — `--text-secondary`
  - Published date — `--text-secondary`
- Compact, subtle — does not compete with article content

**Footer** — same minimal footer

---

### Page: `/about` — About DeLorean

**Full atmospheric layout — the most design-forward page**

**Hero Section**
- Full-viewport height
- Background: body chassis + orange grid (continuous) + larger, more prominent orange radial glow than the homepage hero
- Thin full-width `--border-dim` rule at top of content block
- JetBrains Mono label: `// ABOUT DELOREAN`
- Chakra Petch 700 display headline — large, may use two-tone treatment
- Subheading in JetBrains Mono `--text-secondary`, 2–3 sentences
- Thin `--border-dim` rule below subheading

**Content Sections** (below hero, scrollable)
- `// WHAT WE COVER` — description of content scope (AI in dealerships, voice agents, CRM, etc.)
- `// HOW IT WORKS` — brief plain-language explanation of the automated pipeline
- `// THE NAME` — optional: one paragraph on the DeLorean reference and retrofuturism angle
- Each section: JetBrains Mono all-caps label + Inter 400 body text
- Each content block uses Tier 2 component treatment: `--surface` background, 16px top-left chamfer, `--border` perimeter, orange cut line

**Footer** — same minimal footer

---

## Surface 2 — Admin Dashboard

The admin dashboard shares the same dark aesthetic and chamfer system but feels more utilitarian and data-dense. Less atmospheric, more operational. All structural elements (sidebar, main shell) use Tier 1 borders.

---

### Page: `/login`

- Full-screen `--bg` background with body grid
- Centered card: `--surface`, 16px top-left chamfer, Tier 2 border (dark perimeter + orange cut line)
- Header: `DELOREAN / ADMIN` — JetBrains Mono, `--text-secondary` (with `/` segment in `--text-dim`)
- Fields (both 6px quad-chamfer inputs, dark perimeter + orange cut lines):
  - Email input — JetBrains Mono placeholder
  - Password input — JetBrains Mono placeholder
- Button: `SIGN IN` — full width, primary style (orange fill `--accent`, dark text `#0a0a0a`, 12px dual chamfer)
- No registration link, no forgot password link, no other UI

---

### Layout: Admin Dashboard Shell

All dashboard pages share this shell:

**Sidebar (persistent left, ~220px) — Tier 1 Structural**
- Background: `--structural` (`#000`) — recessed into the body chassis
- Border: full orange perimeter at 40% opacity (`--accent-structural`), chamfer cuts at ~70% opacity for emphasis
- Chamfer: 20px dual (top-left + bottom-right)
- Top: `DELOREAN / ADMIN` wordmark — Chakra Petch 700 for "DELOREAN" (optional two-tone), JetBrains Mono `--text-dim` for `/ ADMIN`
- Nav links (JetBrains Mono, all-caps, 9–10px, 0.25em tracking):
  - `OVERVIEW`
  - `QUEUE` — shows pending count badge if items exist (6px quad-chamfer badge, `--accent` fill, dark text)
  - `SCHEDULED`
  - `PUBLISHED`
  - `SETTINGS`
- Active link: 2px `--accent` left border + `--accent` text + `--accent-glow` background tint across the full item width
- Inactive link: `--text-dim` text, transparent left border
- Bottom (separated by `--border-dim` rule):
  - Pipeline status: `● IDLE` / `● RUNNING` — 7px square dot + JetBrains Mono label. Running dot has a `box-shadow` orange glow.
  - `LOGOUT` link — `--text-dim`, JetBrains Mono

**Main content area** — right of sidebar, **Tier 1 Structural**
- Background: `--structural` (`#000`) — also recessed
- Same Tier 1 orange perimeter @ 40% + 20px dual chamfer
- Scrollable, full height
- Page title at the top: Chakra Petch 700, 22–32px (e.g. `Pipeline Overview`)
- Page label above title: `// PAGE` or section-numbered like `// 01` — JetBrains Mono `--text-dim`

---

### Page: `/dashboard` — Overview

**Stats Row — Tier 2 Component**
- 4 stat cards in a row, each:
  - `--surface` (`#111`) background — lifted above the structural shell
  - 16px **single top-left chamfer** (bottom-right stays square)
  - Tier 2 border: dark perimeter `--border`, orange ONLY on the chamfer cut line
  - **Label** (JetBrains Mono `--text-dim`, 8–9px, 0.25em tracking)
  - **Value** (Inter 900, 36–56px, `--text-primary`)
  - Stat cards:
    - `POSTS PUBLISHED` — count, with optional sub-line `+ N THIS WEEK` (JetBrains Mono `--text-secondary`)
    - `PENDING REVIEW` — count. **Activates orange when > 0:** label in `--accent`, value in `--accent`, solid 3px `--accent` left border (the attention signal)
    - `LAST RUN` — relative timestamp (e.g. `2 DAYS AGO`) — uses smaller value (20–24px, can use Chakra Petch)
    - `NEXT RUN` — absolute date (e.g. `MON MAY 18`) with sub-line `08:00 AM` in `--accent` JetBrains Mono

**Quick Actions**
- `⚡ TRIGGER PIPELINE` — primary button: 12px dual chamfer, `--accent` fill, dark text (`#0a0a0a`), JetBrains Mono all-caps
- `GO TO QUEUE →` — outline button: 12px dual chamfer, transparent background, `--accent` outline, `--accent` text. Shown only if pending review count > 0.

---

### Page: `/dashboard/queue` — Review Queue

**Post List**
- Cards for each `pending_review` post — Tier 2 components, 16px top-left chamfer
- Each card: title (Chakra Petch 700), generated date (JetBrains Mono), tags (6px quad-chamfer pills), 1-line summary (Inter 400), `REVIEW →` affordance right
- Hover: lift to `--surface-raised`
- Empty state: `// NO POSTS PENDING REVIEW` in JetBrains Mono `--text-dim`

**Review Panel (opens on card click — slide-in panel or full-page) — Tier 1 Structural**
- Panel chrome: `--structural` (`#000`), 20px dual chamfer, full orange @ 40% perimeter
- Panel header: post title (Chakra Petch 700) + `GENERATED [date]` (JetBrains Mono)
- **Rendered markdown preview** — Inter 400 body, full post as it would appear publicly
- **Source list** — compact, below preview: title + publisher + link per source
- **Action bar** (sticky bottom of panel):
  - `ACCEPT` — primary (orange fill, 12px dual chamfer), opens publish modal
  - `REJECT` — destructive style: `--destructive` outline + `--destructive` text on the cut lines
  - `REGENERATE` — ghost: `--border` perimeter, `--text-secondary` text, dim cut lines
- **Regenerate flow**: textarea appears (6px quad-chamfer input) with placeholder `OPTIONAL: DESCRIBE WHAT TO CHANGE`, `SUBMIT FOR REGENERATION` button (primary) below
- **Accept modal**: nested Tier 1 panel
  - Option 1: `PUBLISH NOW` — publishes immediately on confirm
  - Option 2: date + time picker — `SCHEDULE FOR LATER`
  - Confirm button: `CONFIRM` (primary) / Cancel: `BACK` (ghost)

---

### Page: `/dashboard/scheduled` — Scheduled Posts

**Post List**
- List of `accepted` posts awaiting publish — same Tier 2 card treatment as the queue
- Each row: title, scheduled date/time, tags
- Per row actions (all 12px dual-chamfer buttons):
  - `EDIT SCHEDULE` — outline style, opens inline date/time picker
  - `PUBLISH NOW` — primary, publishes immediately with confirm prompt
  - `BACK TO QUEUE` — ghost, moves post back to pending review

---

### Page: `/dashboard/published` — Published Posts

**Post List**
- Read-only list of all `published` posts — Tier 2 cards
- Each row: title, publish date (with `● PUBLISHED` `--success` dot), tags
- Per row: `VIEW POST →` outline button — opens public blog post in new tab
- No edit actions — published posts are final

---

### Page: `/dashboard/settings` — Settings

**Publishing Mode**
- Label: `PUBLISHING MODE` (JetBrains Mono `--text-dim`)
- Toggle: `AUTO` | `APPROVE ONLY` (segmented control, 12px chamfered, active segment fills `--accent`)
- Description of each mode shown below toggle (Inter 400 `--text-secondary`)

**Schedule** (read-only)
- Label: `PIPELINE SCHEDULE`
- Current schedule displayed: `MON + THU AT 8:00 AM` (Chakra Petch 600)
- Note: cadence (both days and frequency) is fixed in code and not configurable in UI

**Pipeline**
- Label: `MANUAL CONTROLS`
- `⚡ TRIGGER MANUAL RUN` button (primary)
- Last run: `LAST RUN [timestamp]` (JetBrains Mono)
- Next scheduled: `NEXT RUN [timestamp]` (JetBrains Mono)

**Session**
- Label: `SESSION`
- Current admin email displayed (JetBrains Mono `--text-primary`)
- `LOGOUT` button (ghost)

---

## Component Reference

| Component | Surface | Tier | Chamfer | Border | Notes |
|---|---|---|---|---|---|
| Sidebar | Admin | 1 Structural | 20px dual | `--accent` @ 40% perim, ~70% on cuts | `--structural` `#000` background. Active item: 2px accent left border + glow tint. |
| Main shell | Admin | 1 Structural | 20px dual | `--accent` @ 40% perim, ~70% on cuts | `--structural` `#000` background. Wraps every dashboard page. |
| Review panel | Admin | 1 Structural | 20px dual | `--accent` @ 40% perim, ~70% on cuts | Slide-in or full-page. `--structural` background. |
| Stat card | Admin | 2 Component | 16px top-left only | `--border` perim, `--accent` on cut | Inter 900 value. Pending Review activates orange when > 0. |
| Post card (blog index) | Public | 2 Component | 16px top-left only | `--border` perim, `--accent` on cut | Left accent bar + Chakra Petch title. |
| Queue/Scheduled/Published row | Admin | 2 Component | 16px top-left only | `--border` perim, `--accent` on cut | Same as stat card chrome, list layout. |
| Button — primary | Both | 2 Component | 12px dual (TL+BR) | Solid `--accent` fill | Dark text `#0a0a0a`. Hover: `--accent-dim`. |
| Button — outline | Both | 2 Component | 12px dual (TL+BR) | `--accent` outline, `--accent` text | Transparent background. |
| Button — ghost | Both | 2 Component | 12px dual (TL+BR) | `--border` outline, `--text-secondary` text | Used for low-emphasis actions. |
| Tag pill | Both | 2 Component | 6px quad | `--border` perim, `--accent` on cuts | Active state: `--accent` perim + `--accent-glow` background + `--accent` text. |
| Input field | Both | 2 Component | 6px quad | `--border` perim, `--accent` on cuts | `--surface` background, JetBrains Mono text. |
| Nav badge (sidebar) | Admin | — | 4px quad | `--accent` fill | Dark text. Shows pending count. |
| Status dot | Admin | — | — | — | 7px square. Running: orange + `box-shadow` glow. |
| Two-tone title | Both | — | — | — | Chakra Petch 700, primary words white, key terms `--accent`. |
| Body grid | Both | — | — | — | Orange @ 6%, 48px cells. Always-on body texture. |
| Radial glow orb | Public | — | — | — | `--accent-glow` blurred CSS radial. Homepage + about hero only. |

---

## Fonts to Load (Google Fonts)

```
https://fonts.googleapis.com/css2
  ?family=Chakra+Petch:wght@500;600;700
  &family=JetBrains+Mono:wght@400;700
  &family=Inter:wght@400;900
  &display=swap
```

- **Chakra Petch** 500 / 600 / 700 — all display titles sitewide (hero, post titles, section headings, page titles, wordmark)
- **JetBrains Mono** 400 / 700 — all UI chrome (labels, tags, metadata, buttons, nav, code blocks)
- **Inter** 400 — body text, summaries, article content
- **Inter** 900 — stat card values only

---

## Implementation Notes

### Chamfer implementation

`clip-path` is the primary tool. Reference polygon for a 16px top-left chamfer:

```css
clip-path: polygon(
  16px 0%,
  100% 0%,
  100% 100%,
  0% 100%,
  0% 16px
);
```

For a 12px dual (top-left + bottom-right):

```css
clip-path: polygon(
  12px 0%,
  100% 0%,
  100% calc(100% - 12px),
  calc(100% - 12px) 100%,
  0% 100%,
  0% 12px
);
```

`clip-path` clips the *fill* but does **not** give you a stroked outline along the clipped edge. To render the dark perimeter + orange cut lines, overlay an absolutely positioned SVG:

```html
<div class="card-wrap relative">
  <div class="card" style="clip-path: polygon(...)">...</div>
  <svg class="border-overlay absolute inset-0 pointer-events-none"
       preserveAspectRatio="none" viewBox="0 0 100 100">
    <polyline points="16,0 100,0 100,100 0,100 0,16"
              fill="none" stroke="#222" stroke-width="1"
              vector-effect="non-scaling-stroke"/>
    <line x1="0" y1="16" x2="16" y2="0"
          stroke="#ff6a00" stroke-width="2"
          vector-effect="non-scaling-stroke"/>
  </svg>
</div>
```

`vector-effect="non-scaling-stroke"` keeps the stroke width consistent regardless of the SVG's rendered size.

**Build a primitive.** Don't inline this pattern across components — wrap it once in a `<ChamferedPanel size="card|button|tag" tier="structural|component">` (or equivalent) and reuse. The SVG overlay scales via `preserveAspectRatio="none"`.

### Body grid

Two stacked `linear-gradient` backgrounds on `body`:

```css
body {
  background-color: var(--bg);
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 48px 48px;
}
```

No mask. The grid runs uniformly. The recessed `--structural` panels (`#000`) sit on top and naturally hide the grid where they cover the body — this is the desired effect.

### Radial glow

```css
.glow-orb {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--accent-glow), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
}
```

Used only on `/` and `/about` heroes. Not in the dashboard.

### General

- All button and label text: JetBrains Mono, all-caps, 0.2em letter-spacing minimum.
- Article body text: never monospaced — Inter 400 at 18px / 1.7 line height.
- Orange `#FF6A00` used only for: active states, primary CTAs, links, chamfer cut lines, structural borders, glow.
- Solid borders only — no dashed borders anywhere.
- Top-left bracket marks `⌐` from v1 are **removed.** They are replaced by the chamfer cut + the orange diagonal line on the cut.
- Mobile: admin sidebar collapses to top nav or hamburger; public blog is fully responsive.
- Single dark theme. No toggle. Ever.
