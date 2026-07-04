# Shared Components — building blocks used across pages

Names for the reusable pieces, so "the Post Card's excerpt" or "the Eval Badge" needs no further pointing.

## Public surface (`frontend/src/components/public/`)

### Post Card (`post-card.tsx`)
The halftone-header card used in the **Reading Modes** grid and the **Related Dispatches** grid.

```
Post Card (whole card is a link, .tg-card)
├── Card Image Slot        ← 5:4 .tg-img-slot placeholder header
│   └── Fig Number         ← optional "FIG. N" tag (Related Dispatches only)
├── Date Row               ← date (accent) · dot · read time
├── Section Line           ← optional ◆ SECTION (showSection variant)
├── Card Title             ← mono uppercase (the card voice)
├── Card Excerpt           ← mono uppercase summary
└── Point List             ← up to 3 tags as "> TAG" chips
```

### Dispatch Row (`dispatch-row.tsx`)
The editorial index list item — mapped in `public/home/04-dispatch-index.md`.

### Wordmark (`wordmark.tsx`)
Fit-to-width "THE GARAGE AI" masthead stage piece (JS-measured font size).

### LogoMark (`logo-mark.tsx`)
The two-ring vector — the only round geometry in the system. Used in the Public Footer and Bottom Nav.

### Ticker (`ticker.tsx`)
Masthead headline loop. `buildTickerItems` interleaves real post titles ("—") with brand taglines ("◆", accent).

### Share Chips (`share-chips.tsx`)
Bare mono share tokens: `X` · `in` · `↗` (copy-link, flashes ✓ in sand).

## Both / dashboard surface (`frontend/src/components/`)

### ChamferedPanel (`chamfered-panel.tsx`)
The chamfer-corner primitive. Props: `tier` (structural / component), `size` (sidebar / shell / card / …), `cut` (left / right / …). Used for the dashboard sidebar, main shell, cards, and the Review Panel.

### Button (`button.tsx`)
The one shared Button. Variants: **primary** (orange fill) / **outline** / **ghost** / **destructive** / **link**.

### Tag (`tag.tsx`)
Small chip for a post tag.

### EvalBadge (`eval-badge.tsx`)
Generation-eval pass/fail readout; appears in card footer bands and the Review Panel's Generation Eval section.

### TaxonomyMeta (`taxonomy-meta.tsx`)
`SECTION · FORMAT (· STORY TYPE)` mono token row for a post.

### Dashboard-only chrome (`frontend/src/components/dashboard/`)
| Component | Name to use |
|---|---|
| `section-header.tsx` | **Section Header** — `// NN` counter + label + rule |
| `page-shell.tsx` | **Page Shell** — fixed page title + bounded scroll region (see `dashboard/_shell.md`) |
| `pagination.tsx` | **Pagination** — page stepper under long lists |
| `pipeline-status-dot.tsx` | **Pipeline Status Dot** — ● IDLE / ● RUNNING readout in the sidebar |
| `toast-context.tsx` | **Toasts** — transient run-result notifications |
| `featured-spotlight.tsx` | **Featured Spotlight** — readout of the pinned post (Overview + Published) |
