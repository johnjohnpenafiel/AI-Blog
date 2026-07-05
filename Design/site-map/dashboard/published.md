# Page — /dashboard/published (Published Posts)

- **Sources:** `frontend/src/app/dashboard/published/page.tsx`, `components/dashboard/published/*`

## Sections

```
Published
├── Section Header
├── Published Row List
│   └── Published Row (×N)
│       ├── Taxonomy Row        ← SECTION · FORMAT (status omitted — implied by the tab)
│       ├── Card Title
│       ├── Card Summary        ← clamped to 2 lines
│       └── Card Footer Band
│           ├── Published date · Eval Badge (left)
│           ├── Feature Toggle  ← "★ Feature" (ghost) ⇄ "★ Featured" (outline + glow)
│           └── View Link       ← "VIEW →", opens the public post in a new tab
├── Pagination
└── Published Empty State
```

Notes:
- The Feature Toggle drives the homepage **Featured Story** band (single pin — pinning one clears the previous).
