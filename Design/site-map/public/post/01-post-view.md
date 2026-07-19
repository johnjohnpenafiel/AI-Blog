# Post · Section 1 — Post View (hero + metadata sidebar + article)

The Post v2 page ("The Garage AI Post v2" canvas): a giant hero title, then a
two-column body — a sticky `/ Metadata` sidebar on the left and the `/ Article`
column on the right. No breadcrumb band, no summary standfirst, no meta strip —
the sidebar carries all the metadata. The whole page (this section plus the
bands below it) runs inside `.tg-post-scale` (0.8 zoom + `line-height: normal`,
the same density calibration as the home index).

- **Source:** `frontend/src/components/public/post-view.tsx` (client), mounted
  by `frontend/src/app/(public)/blog/[slug]/page.tsx`.
- **Background:** `--tg-bg` throughout.

## Elements

```
Post View
├── Hero (.tg-hero)
│   └── Hero Title (.tg-hero-title)  ← Archivo 600, normal width, clamp
│                                      34–98px (≤820px raises the floor:
│                                      clamp 55–68px so the title anchors the
│                                      page on phone/tablet), ink-soft, max 18ch
└── Post Grid (.tg-post — 280–380px sidebar | 1fr article; ≤820px stacks)
    ├── Metadata Sidebar (.tg-meta — sticky top 32px ≥821px)
    │   ├── Mini Title (.tg-meta-minititle)  ← hidden until the hero title
    │   │       scrolls out of the scrollport (IntersectionObserver), then
    │   │       slides open (grid-rows animation); hidden ≤820px
    │   ├── "/ Metadata" rule (.tg-colrule + .tg-collabel)
    │   ├── Meta Rows (.tg-meta-row — dashed hairline separators)
    │   │   ├── Date:          dotted date (.tg-meta-val, orange)
    │   │   ├── Author:        "The Garage Desk" gold chip (.tg-meta-chip)
    │   │   ├── Reading time:  "N min read" (.tg-meta-val, ink-soft)
    │   │   └── Categories:    one gold chip per tag (.tg-meta-chips)
    │   └── Share Block (.tg-meta-block)
    │       └── Button Row (.tg-btnrow) ← Twitter/X · LinkedIn (.tg-btn,
    │             mono ghost buttons; hover floods orange with ink-black text)
    └── Article (.tg-article — max 820px)
        ├── "/ Article" rule (.tg-colrule) + Expand Button (.tg-expand-btn)
        │       ← corner-bracket icon; opens the full-page Reader Overlay.
        │         Hidden ≤820px — the article is already full-width there, so
        │         the reader adds nothing (the overlay's own close keeps it)
        ├── Lede (p.tg-lede)      ← the markdown's first plain paragraph,
        │                            21px #e2ded8 (leading `# H1` is stripped —
        │                            the hero owns the title)
        ├── FIG.0 (.tg-fig)       ← AI-generated cover in a 16:9 ink-black
        │   └── .tg-fig-frame + .tg-figcap   frame; placeholder (.tg-img-slot)
        │                            when image_url is null (.tg-fig-empty is
        │                            hidden ≤720px)
        └── Markdown body         ← p 18.5px ink-soft · h2 clamp 28–44px ·
                                     orange underlined links · orange-rule
                                     blockquotes · `>`-marker mono lists
Reader Overlay (.tg-reader — fixed, z-400, blurred backdrop)
└── Panel (.tg-reader-panel)     ← inset bordered panel; close button
        (.tg-reader-close), Escape / backdrop click closes; article re-rendered
        full-width inside (.tg-reader-inner)
```

## Notes

- The gold `.tg-meta-chip` (oklch gold, dashed border) is a canvas literal —
  a sanctioned dashed-border exception alongside `.tg-needs`, scoped to the
  metadata sidebar.
- Share is the canvas's two-button row (X + LinkedIn share intents); the old
  copy-link chip retired with the meta strip.
