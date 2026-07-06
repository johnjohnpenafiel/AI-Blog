# Home · Section 1 — Hero Intro

The index hero: solid dark background, positioning statement on the left. The right-side card stack ("Up Next" + the animated pipeline readout) is currently **parked/hidden** (see below) — the band runs full-width in the meantime.

- **Source:** `frontend/src/components/public/hero-intro.tsx`
- **Background:** solid `var(--tg-bg)` — the video background (`/hero.mp4`) was pulled; revisit later if wanted back.
- **Current layout (cards hidden):** single column (`minmax(0, 1fr)`), no right padding — the identity column runs the band's full width.

## Elements (current state)

```
Hero Intro band (background: var(--tg-bg))
└── Identity Column (full width, carries its own 40/44px vertical padding)
    ├── Kicker             ← "Operator-First · Proof-Over-Hype" (sand)
    ├── Headline           ← "AI is remaking / the dealership." (display, 2 lines)
    ├── Subline            ← one-sentence positioning paragraph
    └── CTA Row            ← Primary "Read the latest →" (.tg-btn) + Ghost "Browse the index ↓"
                               (ghost CTA anchors to #dispatch-index)
```

## Parked: the card stack (`SHOW_HERO_CARDS = false`)

The two-card right column — "Up Next" (live drop tracker) on top, "The Pipeline" (animated Scan → Filter → Write → Drop readout) on the bottom — still exists in the code, gated behind a `SHOW_HERO_CARDS` constant at the top of `hero-intro.tsx`. It is **not deleted**, just not rendered, so it can come back with a one-line flip:

- Flipping `SHOW_HERO_CARDS` to `true` restores: the two-column grid (`1.08fr 0.92fr`, `--tg-edge` right padding), the centered card stack (`.tg-hero-cards`), both cards (`.tg-hero-card`, frame-bordered, `rgba(10,10,10,0.85)` + blur fill), and the full pipeline animation (`.tg-pipe*` — spark + trail + diamond stage nodes, synchronized 9s cycle, `prefers-reduced-motion`-aware). None of that CSS or markup was removed.
- Nothing else in this file changed structurally beyond that gate — the identity column, its copy, and the CTAs are unchanged.

See the git history for this file (prior to the "park the hero cards" commit) for the full card/animation anatomy and rationale if picking this back up.

Notes:
- The **cover post** (linked from the primary CTA) is always the newest published post, independent of the Featured pin. It is deliberately not re-displayed inside the hero band — the Featured Story band and the top of the Dispatch Index already surface it.
- No gutter marker: the band, like all public bands, runs full-width since the rail was removed sitewide.
