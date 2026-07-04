# Home · Section 1 — Hero Intro

The index hero: video background, identity on the left, the live "latest dispatch" card on the right.

- **Source:** `frontend/src/components/public/hero-intro.tsx`
- **Gutter marker:** `(NN)` — the total published-post count, zero-padded.
- **Layout:** two columns (Identity Column | Latest Dispatch Card); card hidden on phones.

## Elements

```
Hero Intro band
├── Hero Video            ← /hero.mp4, autoplaying background
├── Hero Shade            ← left-to-right protection gradient over the video
├── Identity Column (left)
│   ├── Kicker            ← "// The Index · Dealership AI" (sand)
│   ├── Headline          ← "Latest / Dispatches" (display, 2 lines)
│   ├── Subline           ← one-sentence positioning paragraph
│   ├── Primary CTA       ← "Read the latest →" (.tg-btn), links to cover post
│   └── Stats Row         ← three stat pairs (big orange number + tiny mono label):
│                            3× WEEKLY · N SECTIONS · N FORMATS
└── Latest Dispatch Card (right, .tg-hero-card — blurred glass panel)
    ├── Card Header Row   ← "LATEST DISPATCH" label (left) · Live Badge (pulse dot + LIVE, right)
    ├── Meta Row          ← Section Diamond · Format Chip · date + read time
    ├── Card Title        ← cover post title
    ├── Card Summary      ← cover post summary (mono)
    └── Ghost CTA         ← "Read now →" (.tg-btn-ghost)
```

Notes:
- The whole card is one link to the cover post.
- Elements animate in with staggered `.tg-fade-up`.
- The **cover post** is always the newest published post (independent of the Featured pin).
