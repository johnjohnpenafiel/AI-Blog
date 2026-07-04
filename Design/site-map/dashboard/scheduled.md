# Page — /dashboard/scheduled (Scheduled Posts)

- **Sources:** `frontend/src/app/dashboard/scheduled/page.tsx`, `components/dashboard/scheduled/*`

## Sections

```
Scheduled
├── Section Header
├── Scheduled Card List
│   └── Scheduled Card (×N)
│       ├── Top Row             ← Tags (left) · Eval Badge + "SCHEDULED {datetime}" (right)
│       ├── Card Title
│       ├── Taxonomy Meta       ← SECTION · FORMAT
│       ├── Card Summary
│       ├── Action Row
│       │   ├── Edit Schedule Button    ← outline; toggles the Edit Schedule Form inline
│       │   ├── Publish Now Button      ← primary; two-step confirm
│       │   └── Back To Queue Button    ← ghost; two-step confirm (→ pending_review)
│       ├── Edit Schedule Form  ← inline date/time picker + save/cancel
│       └── Card Error Line
└── Scheduled Empty State
```
