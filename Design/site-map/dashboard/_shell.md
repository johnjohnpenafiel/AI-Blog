# Dashboard Shell

Every `/dashboard/*` page renders inside this chassis. Locked viewport — the body never scrolls; only the content region inside the Page Shell does.

- **Sources:** `frontend/src/app/dashboard/layout.tsx`, `components/dashboard/sidebar.tsx`, `components/dashboard/page-shell.tsx`

## Structure

```
Dashboard Chassis (100vh, body grid behind)
├── Sidebar (ChamferedPanel, structural, left-edge cuts)
│   ├── Mobile Drawer Chrome    ← hamburger "≡ MENU" trigger, backdrop, ✕ close (mobile only)
│   ├── Admin Wordmark          ← "THE GARAGE AI" + "ADMIN" sub-line
│   ├── Nav List                ← Overview / Queue / Scheduled / Published / Settings
│   │   ├── Active Item         ← orange left bar + glow tint + accent text
│   │   └── Queue Badge         ← orange count chip on Queue when pending > 0
│   └── Sidebar Footer          ← Pipeline Status Dot (● IDLE / ● RUNNING)
└── Main Shell (ChamferedPanel, structural, right-edge cuts — mirrors the sidebar)
    └── Page Shell (per page)
        ├── Page Title Header   ← fixed at the top of the shell (title + optional sub-title)
        └── Content Region      ← the only thing that scrolls
```

## Names to use
| Element | Meaning |
|---|---|
| **Sidebar** | The whole left structural panel |
| **Main Shell** | The right structural panel wrapping every page |
| **Page Shell** | Title header + scroll region inside the Main Shell |
| **Nav List / Queue Badge / Pipeline Status Dot** | As drawn above |
