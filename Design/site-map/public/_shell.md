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
    │   ├── Wordmark Block (.tg-masthead-brand)  ← fit-to-width "THE GARAGE AI" (Wordmark)
    │   └── Ticker (.tg-ticker)                  ← infinite-scroll headline band
    │       └── Ticker Items                     ← real dispatch headlines ("—") interleaved
    │                                              with brand taglines ("◆", accent)
    └── Scroll Region (.tg-stage-scroll)
        ├── {page bands}                         ← the page's content (see per-page files)
        └── Public Footer                        ← last band inside the scroll region
Bottom Nav (fixed, floats over the stage)
```

## Elements

### Masthead
| Element | Notes |
|---|---|
| **Wordmark** | `Wordmark` component — Archivo 700 extended, JS-fitted to span the full masthead width, orange. |
| **Ticker** | `Ticker` component — pure-CSS loop; items built by `buildTickerItems` (recent post titles + taglines). |

### Public Footer
- **Source:** `frontend/src/components/public/public-footer.tsx`
- Gutter: **LogoMark** (the two-ring vector — hidden on mobile).
- Content row: **Copyright Line** (left) · **Thesis Line** ("AI as the dealership operating system", sand, right).

### Bottom Nav
- **Source:** `frontend/src/components/public/bottom-nav.tsx`
- Fixed to the bottom of the viewport, two blurred near-black panels:
  - **Logo Panel** (left) — boxed LogoMark, links home.
  - **Links Panel** (right) — mono nav links: `Home`, `About`. (Subscribe intentionally omitted until Phase 4.)
