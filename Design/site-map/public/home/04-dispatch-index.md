# Home · Section 4 — Dispatch Index

The main archive console: heading + section filter, then the full list of dispatches as editorial rows.

- **Source:** `frontend/src/components/public/dispatch-index.tsx` (rows: `dispatch-row.tsx`)
- **Background:** filter band `--tg-bg` (dark); row list `--tg-band` (light) — part of the alternating sequence.

## Elements

```
Dispatch Index
├── Filter Band
│   ├── Index Heading          ← "All Dispatches" (or the active section name)
│   └── Filter Chip Row        ← "All" + one chip per section present in the data
│       └── Filter Chip (.tg-chip, background var(--tg-band) for contrast)
│           ├── Chip Label     ← section name
│           └── Chip Count     ← zero-padded post count
└── Dispatch Row List (one Dispatch Row per post; hairline between rows)
    └── Dispatch Row (.tg-dispatch — whole row is a link, 28px/30px vertical padding)
        ├── Meta Line          ← date · Section Diamond · Format Chip · read time · LIVE badge
        │                        (LIVE only on the newest post)
        ├── Row Headline       ← post title (display; clamp 22–38px — sized DOWN from
        │                        an earlier pass that ran clamp 28–56px and read too big
        │                        for a list row)
        ├── Row Summary        ← post summary (15px, capped 640px width)
        └── Read Affordance    ← "READ DISPATCH →"
    └── Empty State            ← "// No dispatches in this section yet"
```

Notes:
- Chips are **data-driven** (never dead buckets); Section is the primary browse axis.
- Filtering is client-side, instant, no reload.
- No gutter marker or per-row running index: the rail was removed sitewide, and the running index was dropped as decorative on a dated, reverse-chron list.
- Deliberately smaller than the Featured Story headline (32–60px) — the index rows are meant to read as a scannable archive, not compete with the flagship band above them.
