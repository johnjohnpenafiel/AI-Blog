# Page — /dashboard/settings (Settings)

- **Sources:** `frontend/src/app/dashboard/settings/page.tsx`, `components/dashboard/settings/*`

## Sections (three plain-rectangle cards, stacked)

```
Settings
├── Publishing Mode Card
│   ├── Card Label              ← "PUBLISHING MODE"
│   ├── Mode Toggle             ← segmented AUTO | APPROVE ONLY (PublishingModeToggle)
│   ├── Mode Description        ← explains the active mode
│   └── Mode Error Line
├── Pipeline Card
│   ├── Card Label              ← "PIPELINE"
│   ├── Cadence Readout         ← "MON · THU · FRI AT 8:00 AM" + "fixed in code" note
│   ├── Trigger Manual Run Button  ← primary; "Running…" while in flight
│   ├── Run Timestamps          ← Last Run / Next Run pair
│   ├── Run Result Line         ← success (published slug) or warning (skipped + reason)
│   └── Run Error Line          ← incl. "Pipeline already running" conflict
└── Session Card
    ├── Card Label              ← "SESSION"
    ├── Admin Email
    └── Logout Button           ← ghost
```
