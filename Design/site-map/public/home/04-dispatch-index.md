# Home · Section 4 — Dispatch Index

The main archive console: heading + section filter, then the full list of dispatches as editorial rows.

- **Source:** `frontend/src/components/public/dispatch-index.tsx` (rows: `dispatch-row.tsx`)
- **Gutter markers:** `(index)` for the filter band; each row carries its own running index `(01)`, `(02)`, …

## Elements

```
Dispatch Index
├── Filter Band (lifted background)
│   ├── Index Heading          ← "All Dispatches" (or the active section name)
│   └── Filter Chip Row        ← "All" + one chip per section present in the data
│       └── Filter Chip (.tg-chip)
│           ├── Chip Label     ← section name
│           └── Chip Count     ← zero-padded post count
└── Dispatch Row List (one Dispatch Row per post; hairline between rows)
    └── Dispatch Row (.tg-dispatch — whole row is a link)
        ├── Row Index          ← "(NN)" in the gutter (joins the Meta Line on mobile)
        ├── Meta Line          ← date · Section Diamond · Format Chip · read time · LIVE badge
        │                        (LIVE only on the newest post)
        ├── Row Headline       ← post title (display, very large)
        ├── Row Summary        ← post summary
        └── Read Affordance    ← "READ DISPATCH →"
    └── Empty State            ← "// No dispatches in this section yet"
```

Notes:
- Chips are **data-driven** (never dead buckets); Section is the primary browse axis.
- Filtering is client-side, instant, no reload.
