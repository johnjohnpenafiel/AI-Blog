# Post · Section 1 — Dispatch Header

The whole top of an article page: breadcrumb, title block, metadata strip, and the lead-image slot. One component renders all four bands.

- **Source:** `frontend/src/components/public/dispatch-header.tsx`

## Elements

```
Dispatch Header (four stacked bands)
├── Breadcrumb Band            — marker (↩), lifted background
│   └── Breadcrumb Trail       ← "The Index" link / Section (orange) / Format
├── Title Block Band           — marker (*), orange
│   ├── Badge Row              ← Section Diamond · Format Chip
│   ├── Post Title             ← display, editorial scale, balanced wrapping
│   └── Lede                   ← the post summary as a large standfirst paragraph
├── Metadata Strip Band        — marker (meta), lifted background
│   ├── Meta Items             ← label-over-value pairs (MetaItem):
│   │                             Published / By ("The Garage Desk") / Read time / Filed under (tags)
│   └── Share Group            ← "SHARE" label + Share Chips (X · in · ↗ copy-link)
└── Lead Image Band            — marker (fig.0); hidden on mobile
    ├── Lead Image Slot        ← 16:9 .tg-img-slot placeholder
    └── Figure Caption         ← "FIG.0 — Lead image placeholder"
```

Notes:
- Byline is the static publication voice "The Garage Desk" (no per-post authors).
- Share Chips: `frontend/src/components/public/share-chips.tsx` — X / LinkedIn intents, copy-link flashes ✓.
