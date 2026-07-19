# Home · Section 1 — News Index (the whole page)

The v5 homepage is a single composition: the full dispatch archive as a
filterable editorial row list (Stripe-blog layout, from the "The Garage AI v5"
canvas in the Claude Design project). No hero, no reading-modes carousel, no
featured band — the index IS the page.

- **Source:** `frontend/src/components/public/news-index.tsx`
- **Background:** `--tg-bg` throughout (no band striping on this page).

## Elements

```
News Index
├── News Title (.tg-news-title)   ← giant "News" (Archivo 700, normal width,
│   └── Count Sup (.tg-news-count)   clamp 52–116px, ink-soft) + superscript
│                                    live "(NN)" count in sand
└── Index Body (.tg-idx-body — 320px filter column | 1fr rows; ≤820px stacks)
    ├── Filter Tree (.tg-filters — sticky vs. the stage scroll ≥821px)
    │   ├── "/ Filters" head (.tg-filters-head, mono label + hairline)
    │   ├── Format Group (.tg-fgroup — ▾ chevron + folder icon + orange title)
    │   │   └── Filter Item (.tg-fitem) ← reading-mode label + live count;
    │   │       checkbox (.tg-fbox) fills with the format accent when checked
    │   │       (2-Minute Intel=orange-deep · Go Further=sand ·
    │   │        The Week=orange-bright · Start Here=orange-deep)
    │   ├── Section Group             ← one item per section present (orange-deep)
    │   └── "✕ Clear all" (.tg-clear) ← only while any filter is active
    └── Rows (.tg-rows)
        ├── "/ Date  / Name" head (.tg-rows-head)
        ├── News Row (.tg-row — whole row links to /blog/[slug])
        │   ├── Date (.tg-row-date)     ← orange-deep square bullet + "2026.7.17"
        │   │                             dotted date (month unpadded)
        │   ├── Title (.tg-row-title)   ← one line, Archivo 300 @104%, ellipsized;
        │   │   └── ↗ arrow             ← only when the title is NOT truncated
        │   └── Plus glyph (.tg-row-plus)
        └── Empty State (.tg-rows-empty)
            ← "// No dispatches match these filters" (or the pre-launch
               "// No dispatches published yet — …" when nothing is published)
```

Notes:
- Both filter groups are **data-driven** — only formats/sections present in the
  loaded posts render, with live counts. Multi-select within a group (union),
  intersect across groups. Client-side, instant.
- **Row hover floods the row hot-magenta `#ff3d97`** and flips date/bullet/
  title/plus to ink-black — the one sanctioned non-orange accent, straight from
  the v5 canvas (kept deliberately; see Design/decisions.md 2026-07-18).
- The index manages its own 24px insets (plain divs, not `.tg-band-content`).
- **≤820px (mobile recompose):** each filter group becomes a horizontal
  **filter bar** — fixed label cell (folder icon + orange title, chevron
  hidden) | dashed-mute vertical divider (same dash as the post metadata
  separators) | a scrollbar-less horizontally scrolling item strip. The whole
  filter block is dialed smaller (labels ~13–14px). Selection is a **magenta
  `#ff3d97` flood** on the chosen item (ink-black label, matching the index
  rows' hover), not a font-color change; resting items sit in faint gray.
  "✕ Clear all" drops below the bars, and the `/ Date / Name` head disappears.
  Rows split by band: **tablet (768–820px)** keeps the single-line
  `date | title | +` grid, title one-line ellipsized at the reference density
  (26px, 14px padding, 120px date col, ~43px rows); **phones (<768px)** stack
  the date kicker above a freely wrapping title, `+` spanning both rows.
