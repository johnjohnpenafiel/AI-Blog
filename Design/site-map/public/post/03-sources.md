# Post · Section 3 — Sources

The editorial contract: every dispatch lists its sources.

- **Source:** `frontend/src/components/public/sources-list.tsx`
- **Gutter marker:** `(src)` — lifted background.

## Elements

```
Sources band
├── Sources Header             ← "SOURCES [NN]" (mono, zero-padded count)
├── Source List (ordered)
│   └── Source Item (×N)
│       ├── Item Number        ← "01", "02", … (left mini-column)
│       ├── Source Title Link  ← external link, orange-underline (.tg-body-link)
│       └── Source Credit      ← publisher · date (small mono)
└── Empty State                ← "// No sources listed"
```
