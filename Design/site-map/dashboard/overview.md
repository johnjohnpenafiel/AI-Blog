# Page — /dashboard (Overview)

- **Sources:** `frontend/src/app/dashboard/page.tsx`, `components/dashboard/overview/*`

## Sections (in order)

```
Overview
├── Top Row (Status + Quick Actions side-by-side on desktop, stacked below lg)
│   ├── // 01 Status (SectionHeader + StatusList)
│   │   └── Stat Items:
│   │       ├── Posts Published
│   │       ├── Pending Review        ← activates orange when > 0
│   │       ├── Mode                  ← Auto / Approve Only
│   │       ├── Last Run              ← relative timestamp
│   │       └── Next Run              ← weekday date · time
│   └── // 02 Quick Actions
│       ├── Trigger Pipeline Button   ← primary; drives started/completed refresh
│       └── Go To Queue Button        ← outline; dims (not hides) when pending = 0
├── // 03 Featured
│   └── Featured Spotlight            ← pinned post readout, or the
│                                        "no post pinned" empty panel
└── Overview Footer                   ← product/version (left) · attribution (right)
```

Behavior worth naming: the page polls **Pipeline Status** (fast while running) and refreshes counts when a run finishes.
