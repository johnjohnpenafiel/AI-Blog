# About · Section 2 — Content Sections

Three identical-anatomy bands after the intro, alternating band background.

- **Source:** `frontend/src/app/(public)/about/page.tsx` (`SECTIONS` array → the `band()` helper)
- **Gutter markers:** `(01)`, `(02)`, `(03)`

## The three sections (in order)

| Marker | Kicker | Name to use |
|---|---|---|
| `(01)` | `// What we cover` | **What We Cover** |
| `(02)` | `// How it works` | **How It Works** |
| `(03)` | `// The point of view` | **The Point of View** |

## Shared anatomy (each band)

```
Content Section band
├── Kicker             ← "// {section label}"
├── Section Heading    ← display headline
└── Body Paragraphs    ← 1–2 editorial paragraphs
```

Notes:
- Adding a fourth section = one more entry in the `SECTIONS` array; markers renumber sequentially.
