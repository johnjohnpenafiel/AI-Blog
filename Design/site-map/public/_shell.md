# Public Shell — the Stage Frame

Every public page (`/`, `/blog/[slug]`, `/about`) renders inside this shell.

- **Source:** `frontend/src/app/(public)/layout.tsx`
- **Scroll model:** desktop = locked viewport (100dvh, internal scroll); mobile ≤768px = natural document scroll.

## Structure (outermost → innermost)

```
Stage (.tg-stage)
└── Stage Frame (.tg-frame .tg-stage-frame)      ← 3px gray frame inset around the viewport
    ├── Scanline (.tg-scanline)                  ← faint texture overlay across the whole stage
    ├── Masthead (header)                        ← pinned on desktop, in-flow on mobile
    │   ├── Wordmark Block (.tg-masthead-brand   ← DESKTOP (>768px): fit-to-width
    │   │     .tg-masthead-desktop)                "THE GARAGE AI" (Wordmark); own bottom rule
    │   └── Mobile Masthead (.tg-masthead-mobile) ← ≤768px: burger (left) | fixed-size
    │         (MobileMasthead)                      centered wordmark | ghost mirror; opens the menu
    └── Scroll Region (.tg-stage-scroll)
        ├── {page bands}                         ← the page's content (see per-page files)
        └── Public Footer                        ← last band inside the scroll region
Bottom Nav (fixed, floats over the stage)
```

## Elements

### Masthead
| Element | Notes |
|---|---|
| **Wordmark** (desktop, >768px) | `Wordmark` component — Archivo 700 extended, JS-fitted to span the full masthead width, orange. |
| **Mobile Masthead** (≤768px) | `MobileMasthead` (`components/public/mobile-masthead.tsx`) — a NYT-style bar: quiet muted-gray **burger** left (brightens to ink on tap, no frame/fill — it only opens the menu), a fixed-size centered orange wordmark (`clamp(19–25px)`, growing toward the tablet edge), and an invisible burger mirror right so the wordmark centers truly. |

The burger opens a **full-screen menu overlay** (`.tg-mobnav`, portaled to `<body>` so the frame's stacking context can't trap it, carries `tg-surface` for the tokens): ✕ close top-left, then stacked Archivo links (News · About) over hairline dividers. Closes on link tap, ✕, Escape, or route change; freezes the page scroll while open. No search / subsections (we don't have them).

The scrolling headline ticker (`Ticker` / `buildTickerItems`) that previously ran under the wordmark was removed — the masthead is wordmark-only now.

### Public Footer
- **Source:** `frontend/src/components/public/public-footer.tsx`
- Gutter: **LogoMark** (the two-ring vector — hidden on mobile).
- Content row: **Copyright Line** (left) · **Thesis Line** ("AI as the dealership operating system", sand, right).

### Bottom Nav
- **Source:** `frontend/src/components/public/bottom-nav.tsx`
- **Desktop-only** (`.tg-bottom-nav`, hidden ≤768px) — on mobile the burger menu owns navigation, so this floating nav would just duplicate it.
- Fixed to the bottom of the viewport, a blurred near-black panel of mono nav links: `News`, `About` (right-aligned; Subscribe omitted until Phase 4).
