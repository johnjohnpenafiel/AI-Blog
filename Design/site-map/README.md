# Site Map — the shared vocabulary for UI work

A reference map of every page, section, and element of both surfaces, **as built** (read from the actual components, not the design brief). Use these names when asking for changes — e.g. *"in the Hero Intro, make the Stats Row smaller"* — and the target is unambiguous.

Each file describes **structure and element names only** (no copy/content — that changes). Every section lists its source component so the map always points at real code.

## Layout of this directory

```
site-map/
├── README.md                  ← you are here
├── components.md              ← shared building blocks used across pages
├── public/                    ← Surface 1: the public blog (The Garage AI)
│   ├── _shell.md              ← the Stage Frame every public page renders inside
│   ├── home/                  ← "/" — one file per section, top-to-bottom
│   │   ├── 01-hero-intro.md
│   │   ├── 02-reading-modes.md
│   │   ├── 03-featured-story.md
│   │   └── 04-dispatch-index.md
│   ├── post/                  ← "/blog/[slug]" — one file per section
│   │   ├── 01-dispatch-header.md
│   │   ├── 02-article-body.md
│   │   ├── 03-sources.md
│   │   └── 04-related-dispatches.md
│   └── about/                 ← "/about"
│       ├── 01-intro.md
│       └── 02-content-sections.md
└── dashboard/                 ← Surface 2: the admin dashboard (one file per page)
    ├── _shell.md              ← sidebar + main shell + page shell
    ├── login.md
    ├── overview.md
    ├── queue.md
    ├── scheduled.md
    ├── published.md
    └── settings.md
```

Public pages are band-heavy, so they get a directory with one file per section (files are numbered in visual top-to-bottom order). Dashboard pages are simpler, so each page is a single file listing its sections.

## Public-surface vocabulary (used throughout `public/`)

The public design is built from a small set of recurring structures:

| Term | What it is |
|---|---|
| **Stage Frame** | The shared shell: 3px gray frame inset around the whole viewport, masthead on top, scroll region below, fixed Bottom Nav floating over everything. See `public/_shell.md`. |
| **Band** | A full-width horizontal section (`.tg-band`). Every public page is a vertical stack of bands separated by hairline rules. Alternating bands may use the slightly-lifted band background. |
| **Gutter Marker** | The left column of every band (`.tg-band-marker`): a small mono token in parentheses that indexes the band — e.g. `(01)`, `(★)`, `(index)`, `(src)`. Collapsed on mobile. |
| **Content Column** | The right column of a band (`.tg-band-content`) — where the section's actual elements live. |
| **Kicker** | A small mono all-caps label starting with `//` above a heading — e.g. `// The Index · Dealership AI`. |
| **Meta Line** | A horizontal row of small mono tokens (date · ◆ section · format chip · read time · LIVE). |
| **Section Diamond** | `◆ SECTION NAME` — orange mono token marking a post's section. |
| **Format Chip** | The post's format (BRIEF / DEEP DIVE / ROUNDUP) in a thin outlined chip, tinted by the format's accent color. |
| **Image Slot** | `.tg-img-slot` — a framed placeholder where house imagery will eventually go (only the hero video is a real asset today). |
| **Rule Header** | A row of: pulse dot + mono label + stretching hairline + right-aligned mono count (e.g. "Related dispatches ———— 03 READS"). |

## Dashboard-surface vocabulary (used throughout `dashboard/`)

The dashboard is the chamfer system from `Design/README.md`:

| Term | What it is |
|---|---|
| **Chamfered Panel** | Any shape with the 45° corner cut (`ChamferedPanel`, tiers: structural / component). |
| **Section Header** | `// NN` counter + label + hairline rule introducing a page section (`SectionHeader`). |
| **Card Footer Band** | The lighter strip at the bottom of a card (raised surface + hairline divider) holding date / eval / actions. |
| **Eval Badge** | The generation-eval pass/fail readout shown on cards and in the Review Panel (`EvalBadge`). |
| **Taxonomy Row** | `SECTION · FORMAT` mono tokens at the top of a card (`TaxonomyMeta` or inline). |

## Keeping this map current

When a section is added, removed, or restructured, update its file in the same PR. Names here are the contract — if a better name is agreed in conversation, rename it here too.

Run **`/sync-site-map`** before a design session (or whenever in doubt): it audits every file here against the actual frontend code and updates whatever drifted. `/sync-site-map full` forces a complete re-verification. The line below is the sync baseline — the command diffs `frontend/src` against it and maintains it automatically; don't edit it by hand.

Last synced: e2af21d · 2026-07-04
