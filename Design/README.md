# DeLorean — UI Design Brief

## What Is DeLorean

DeLorean is an automated bi-weekly blog covering AI and operational technology developments in the automotive industry. It has two surfaces:

- **Public Blog (DeLorean)** — where readers discover and read posts
- **Admin Dashboard** — where a single operator manages the publishing pipeline

This document defines the visual design direction and page-by-page UI structure for both surfaces. Use this as the source of truth when building or designing any UI component.

---

## Design System

### Aesthetic Direction
Dark command-center editorial. Inspired by retrofuturism and premium tech journalism. The UI chrome (nav, cards, labels, metadata) carries a terminal/operations aesthetic. Article body text stays clean and readable. The overall feel is intentional, controlled, and cinematic.

Reference aesthetic: think a premium editorial publication designed by engineers — top-left bracket marks on cards, monospaced labels, solid borders, and a deep blue atmospheric glow.

### Color Tokens
| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0a0a0a` | Page background |
| `--surface` | `#111111` | Cards, panels |
| `--border` | `#222222` | Subtle borders |
| `--text-primary` | `#f0f0f0` | Headings, body text |
| `--text-secondary` | `#888888` | Metadata, dates, labels |
| `--accent` | `#1a3fff` | Interactive elements, active states, highlights |
| `--accent-glow` | `#1a3fff` at 30% opacity, blurred | Atmospheric background glow |
| `--accent-dim` | `#0f2299` | Hover states, active tag backgrounds |

### Typography
| Role | Font | Style |
|---|---|---|
| UI chrome — nav, labels, tags, metadata, buttons | `JetBrains Mono` or `IBM Plex Mono` | All-caps, tight letter-spacing |
| Main titles — post titles, hero title, section headings, about page display text | Heavy sans-serif (e.g. `Inter 800` or `Inter 900`) | Large, heavy weight — used consistently across ALL main titles sitewide for visual consistency |
| Body / article text | `Inter` or `DM Sans` | Regular weight, well-spaced, readable |

**Typography rule:** All main titles across the entire site — hero, post pages, about page, index section heading — use the same heavy sans-serif. No serif anywhere. This ensures a unified typographic identity throughout DeLorean.

### Decorative Elements
- **Left accent vertical bar** — a short accent blue (`--accent`) vertical bar on the left edge of post cards in the index. Replaces the top-left bracket `⌐`. Used on index cards only.
- **Solid borders** — thin solid borders (`1px solid --border`) on cards and containers. No dashed borders anywhere.
- **Horizontal rule lines** — thin full-width lines used in the hero to isolate content like a terminal readout. Also used as section separators.
- **Dark grid overlay** — continuous grid layer starting at the bottom quarter of the hero through the full index section. Vignette-masked on all sides.
- **Blue radial glow orb** — large blurred circle in `--accent-glow`, used as atmospheric background on hero sections and the about page
- **Monospaced all-caps labels** — used for all UI chrome text, never for article content
- **Two-tone title treatment** — hero and key display titles use white for primary words and accent blue (`--accent`) for key terms. Applied selectively, not globally.

### Rules
- Single dark theme — no light/dark toggle
- No photography or images in the UI — typography and color carry the design
- Blue accent used sparingly — active states, CTAs, and glow only

---

## Surface 1 — Public Blog (DeLorean)

### Page: `/` — Homepage

**Nav (sticky)**
- Left: `DELOREAN` wordmark in monospaced font
- Right: `BLOG` and `ABOUT` text links, monospaced, all-caps
- Background: `--bg` with subtle bottom border on scroll

**Hero / Cover Story**
- Full-width section, cinematic height (~80–90vh)
- **Background layers (bottom to top):**
  1. Deep black base (`--bg`)
  2. Blue radial glow orb — large, soft, atmospheric, diffused like light through fog
- **Grid — important: the grid is NOT part of the hero background.** It begins to appear only in the bottom quarter of the hero section, fading in from invisible, and continues uninterrupted through the entire index section below. The hero top ~75% has no grid at all.
- **Content composition:**
  - Thin full-width horizontal rule above the label row — terminal separator
  - **Label row** (full width, two sides):
    - Left: `// COVER STORY` + dash line + `ISSUE 04 · MAY 2026` — monospaced, all-caps, secondary color
    - Right: `● LIVE FEED` — accent blue dot + monospaced label. Fixed styling for the cover story header.
  - **Title** — large heavy sans-serif, 2–3 lines. **Two-tone treatment:** primary words in white (`--text-primary`), key terms (e.g. "AI and technology", "automotive") in accent blue (`--accent`). Dominant, full-width.
  - Thin full-width horizontal rule below the title
  - 1-line summary — monospaced, secondary color, all-caps
  - Tag pill(s) + read time — monospaced, right-aligned on the same row
  - CTA button: `READ STORY →` — solid accent blue border, accent blue text, monospaced, no fill
  - Author + date line below CTA: e.g. `MARCO LENZ · MAY 6, 2026` — monospaced, secondary color
- **Structural framing:**
  - Two thin horizontal lines isolate the content block (above label, below read time) — like a terminal readout isolating a signal
  - Optional faint vertical line on the left edge of the content block — subtle `|` margin marker
- No card, no bracket — framing is done through lines, not boxes
- Overall effect: cinematic atmosphere + operational precision — live intelligence feed aesthetic

**Grid Layer (hero bottom → full index section)**
- The grid is a single continuous layer that spans from the bottom quarter of the hero through the entire tag filter and posts grid sections
- **Visibility start point:** the grid begins to become barely visible at exactly the last 1/4 of the hero section — so when a visitor lands on the page, they can already see the grid faintly materializing before they scroll. This is intentional and should be noticeable, not hidden.
- **Fade-in behavior:** completely invisible above the last 1/4 of the hero, gradually materializes downward — never has a hard top edge
- **Vignette mask:** the grid fades out on all four sides using a radial or multi-directional gradient mask:
  - Top: starts becoming barely visible at the 75% mark of the hero (last 1/4), fades in smoothly downward
  - Left + Right: fades from black inward — grid is darkest at the edges, brightest toward center
  - Bottom: fades back out to black before the footer
- **Brightest point:** center of the index/posts grid section — this is where the grid is most visible
- **Grid style:** thin lines, low-to-mid opacity at peak (~10–15%), dark enough to feel technical without competing with card content
- **Implementation:** CSS `repeating-linear-gradient` for the grid lines + CSS `mask-image` with a radial gradient for the vignette fade. The grid and its mask sit as an absolutely positioned layer behind all content.

**Tag Filter**
- Sits between hero and posts grid — sits on top of the grid layer
- Monospaced all-caps pill tags: `ALL` `VOICE AI` `CRM` `PRICING & ANALYTICS` `MERCHANDISING` `SALES DEV` `OT & INFRASTRUCTURE` `INDUSTRY MOVE`
- Default active: `ALL`
- Active state: `--accent` background, white text
- Inactive: solid border, `--text-secondary` text
- Filters the posts grid below in real time (no page reload)

**Index Section Header**
- Label row: `// THE INDEX` + dash line + `[n] TRANSMISSIONS` — monospaced, all-caps, secondary color. Count updates dynamically.
- Section heading: `Latest dispatches` — large heavy sans-serif, same title typography as hero
- `VIEW ARCHIVE →` — right-aligned, monospaced, secondary color. Links to full archive (future feature, render as inactive for MVP if needed)

**Post Cards (Index)**
- Full-width rows — single column, not a 2-column grid
- Each card sits on top of the grid layer
- Each card:
  - **Left accent blue vertical bar** — short `--accent` colored bar on the far left edge of the card. Replaces bracket. Visual anchor and category indicator.
  - Top row: tag pill (monospaced, solid border) left — publish date (`MAY 04, 2026` format) right
  - Post title — large heavy sans-serif, dominant
  - 1-line summary — regular weight, secondary color
  - Bottom row: read time left — `READ →` right
  - Solid border bottom, separates cards
- Empty state: `// NO TRANSMISSIONS FOUND` in monospaced secondary text

**Footer**
- `DELOREAN` wordmark left
- Tagline: `THE PULSE OF AI AND TECHNOLOGY RESHAPING THE AUTOMOTIVE INDUSTRY`
- Links: `BLOG` `ABOUT` right-aligned
- Top border, minimal padding
- All monospaced, secondary text color

---

### Page: `/blog/[slug]` — Individual Post

**Nav** — same sticky nav as homepage

**Post Header**
- Large serif title (full width, editorial scale)
- Row of metadata below title (monospaced, secondary):
  - Publish date
  - Read time
  - Tag pill(s)
- Thin separator line below header

**Body**
- Clean rendered markdown
- Comfortable reading width (~680px max, centered)
- Font: clean sans-serif, 18px, 1.7 line height
- Headings in serif
- Code blocks (if any) in monospaced with `--surface` background
- No sidebar, no distractions

**Share Bar**
- Positioned below the body, above sources
- Label: `SHARE THIS POST →` in monospaced all-caps
- Three buttons: `X` `LINKEDIN` `COPY LINK`
- Solid border, accent blue on hover
- Copy link shows brief `COPIED ✓` confirmation state

**Sources**
- Collapsible section below share bar
- Header: `SOURCES [n]` — monospaced, all-caps, secondary color
- Expanded: list of sources, each showing:
  - Article title (linked, accent blue)
  - Publisher name — secondary text
  - Published date — secondary text
- Compact, subtle — does not compete with article content

**Footer** — same minimal footer

---

### Page: `/about` — About DeLorean

**Full atmospheric layout — the most design-forward page**

**Hero Section**
- Full-viewport height
- Same three-layer background as homepage hero: deep black + blue radial glow orb (more prominent here) + subtle dark grid overlay
- Thin full-width horizontal rule at top of content block
- Large monospaced all-caps label: `// ABOUT DELOREAN`
- Large serif display headline below
- Subheading in monospaced secondary text, 2–3 sentences
- Thin full-width horizontal rule below subheading

**Content Sections** (below hero, scrollable)
- `// WHAT WE COVER` — description of content scope (AI in dealerships, voice agents, CRM, etc.)
- `// HOW IT WORKS` — brief plain-language explanation of the automated pipeline
- `// THE NAME` — optional: one paragraph on the DeLorean reference and retrofuturism angle
- Each section: monospaced all-caps label + serif or sans body text
- Top-left bracket mark on each content block, solid border

**Footer** — same minimal footer

---

## Surface 2 — Admin Dashboard

The admin dashboard shares the same dark aesthetic but feels more utilitarian and data-dense. Less atmospheric, more operational.

---

### Page: `/login`

- Full-screen dark background (`--bg`)
- Centered card, `--surface` background, top-left bracket mark, solid border
- Header: `DELOREAN / ADMIN` — monospaced all-caps, secondary color
- Fields:
  - Email input — solid border, monospaced placeholder
  - Password input — solid border, monospaced placeholder
- Button: `SIGN IN` — full width, `--accent` background, white monospaced text
- No registration link, no forgot password link, no other UI

---

### Layout: Admin Dashboard Shell

All dashboard pages share this shell:

**Sidebar (persistent left, ~220px)**
- Top: `DELOREAN` wordmark + `/ ADMIN` label
- Nav links (monospaced all-caps):
  - `OVERVIEW`
  - `QUEUE` — shows pending count badge if items exist
  - `SCHEDULED`
  - `PUBLISHED`
  - `SETTINGS`
- Active link: accent blue left border + text
- Bottom: pipeline status indicator + logout
  - Status: `● IDLE` or `● RUNNING` — monospaced, color-coded (gray / accent blue)
  - `LOGOUT` link — secondary text, bottom of sidebar

**Main content area** — right of sidebar, full height, scrollable

---

### Page: `/dashboard` — Overview

**Stats Row**
- 4 stat cards in a row (top-left bracket mark, solid border):
  - `POSTS PUBLISHED` — count
  - `PENDING REVIEW` — count, accent blue if > 0
  - `LAST RUN` — relative timestamp (e.g. `2 DAYS AGO`)
  - `NEXT RUN` — absolute date (e.g. `MON MAY 12`)
- Monospaced values, large number display

**Quick Actions**
- `TRIGGER PIPELINE` — primary button, accent blue, solid border
- `GO TO QUEUE →` — shown only if pending review count > 0

---

### Page: `/dashboard/queue` — Review Queue

**Post List**
- Cards for each `pending_review` post
- Each card: title, generated date, tags, 1-line summary, `REVIEW →` affordance
- Empty state: `// NO POSTS PENDING REVIEW`

**Review Panel (opens on card click — slide-in panel or full-page)**
- Panel header: post title + `GENERATED [date]`
- **Rendered markdown preview** — full post as it would appear publicly
- **Source list** — compact, below preview: title + publisher + link per source
- **Action bar** (sticky bottom of panel):
  - `ACCEPT` — accent blue, opens publish modal
  - `REJECT` — secondary/destructive style
  - `REGENERATE` — opens feedback textarea inline
- **Regenerate flow**: textarea appears with placeholder `OPTIONAL: DESCRIBE WHAT TO CHANGE`, `SUBMIT FOR REGENERATION` button below
- **Accept modal**:
  - Option 1: `PUBLISH NOW` — publishes immediately on confirm
  - Option 2: date + time picker — `SCHEDULE FOR LATER`
  - Confirm button: `CONFIRM` / Cancel: `BACK`

---

### Page: `/dashboard/scheduled` — Scheduled Posts

**Post List**
- List of `accepted` posts awaiting publish
- Each row: title, scheduled date/time, tags
- Per row actions:
  - `EDIT SCHEDULE` — opens inline date/time picker
  - `PUBLISH NOW` — publishes immediately with confirm prompt
  - `BACK TO QUEUE` — moves post back to pending review

---

### Page: `/dashboard/published` — Published Posts

**Post List**
- Read-only list of all `published` posts
- Each row: title, publish date, tags
- Per row: `VIEW POST →` — opens public blog post in new tab
- No edit actions — published posts are final

---

### Page: `/dashboard/settings` — Settings

**Publishing Mode**
- Label: `PUBLISHING MODE`
- Toggle: `AUTO` | `APPROVE ONLY`
- Description of each mode shown below toggle

**Schedule**
- Label: `PIPELINE SCHEDULE`
- Current schedule displayed: e.g. `EVERY OTHER MONDAY AT 8:00 AM`
- Day-of-week selector (dropdown or segmented control)
- Note: frequency is fixed at bi-weekly, not configurable in UI

**Pipeline**
- Label: `MANUAL CONTROLS`
- `TRIGGER MANUAL RUN` button
- Last run: `LAST RUN [timestamp]`
- Next scheduled: `NEXT RUN [timestamp]`

**Session**
- Label: `SESSION`
- Current admin email displayed
- `LOGOUT` button

---

## Component Reference

| Component | Used In | Notes |
|---|---|---|
| Left accent vertical bar | Index post cards | Short `--accent` blue bar on left card edge. Replaces bracket. |
| Two-tone title | Hero title, key display headings | White for primary words, `--accent` blue for key terms |
| Cover story label row | Hero section | `// COVER STORY` + dash + issue/date left, `● LIVE FEED` right. Fixed styling. |
| Tag pill | Post cards, post header, tag filter | Solid border, monospaced, all-caps |
| Stat card | Dashboard overview | Solid border, large monospaced number |
| Action bar | Review queue panel | Sticky bottom, 3 actions |
| Share bar | Individual post page | X + LinkedIn + Copy link |
| Source list | Post page + review panel | Compact, collapsible |
| Pipeline status | Sidebar | Color-coded dot + monospaced label |
| Radial glow orb | Homepage hero, about page hero | CSS radial gradient, blurred, accent color |
| Dark grid overlay | Homepage — hero bottom quarter through full index section | CSS repeating-linear-gradient + mask-image radial vignette. Fades in from top, fades out on all four edges. Brightest at center of index. Never appears in top 75% of hero. |
| Horizontal rule lines | Hero content block, section separators | 1px solid, full content width, isolates content like terminal readout |

---

## Fonts to Load (Google Fonts or Self-Hosted)

- `JetBrains Mono` — UI chrome (labels, tags, metadata, buttons)
- `Inter 800 / 900` — all main titles sitewide (hero, post titles, section headings, about page)
- `Inter 400` — body text, summaries, general UI

---

## Notes for Implementation

- All button and label text: monospaced, all-caps, tight letter-spacing
- Article body text: never monospaced — use Inter or DM Sans at comfortable reading size
- Blue accent (`#1a3fff`) used only for: active states, primary CTAs, links, glow effect
- Solid borders only — no dashed borders anywhere in the UI
- Top-left bracket `⌐` on cards and panels only — never on hero or full-bleed sections
- Grid overlay: begins at bottom quarter of hero, runs through full index section. CSS `repeating-linear-gradient` for lines + `mask-image` with radial gradient for vignette fade on all four sides. Peak opacity ~10–15% at center of index. Absolutely positioned layer behind all content.
- Radial glow orb: CSS `radial-gradient` or blurred `div` — not an image
- Horizontal rule lines in hero: `1px solid --border` or slightly lighter, full content width
- Mobile: sidebar collapses to top nav or hamburger on admin; public blog is fully responsive
