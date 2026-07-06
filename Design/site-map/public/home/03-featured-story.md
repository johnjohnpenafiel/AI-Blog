# Home · Section 3 — Featured Story

The cover dispatch, framed as a distinct **artifact** rather than a bigger post-card — a bordered inset object sitting on the band, not another flat row/rule like the dispatch list or post-card grid.

- **Source:** `frontend/src/components/public/featured-story.tsx`
- **Layout:** band background `--tg-band` (light); the framed object inside is a *darker* inset (`--tg-bg`) with `1px var(--tg-frame)` on left/right/bottom and a `2px var(--tg-orange)` top rule (`.tg-featured-frame`, padding responsive at ≤720px) — a mat-and-frame effect that pops the object forward from its lighter surround. Inside: two columns (Story Column `1.1fr` | Featured Image Slot `0.9fr`), collapsing to one column ≤760px (image slot hidden).

## Elements

```
Featured Story band (background: var(--tg-band))
└── Frame (.tg-featured-frame — background: var(--tg-bg), 1px sides/bottom,
    │       2px orange top rule)
    ├── Watermark Star ★     ← huge ghost glyph (clamp 160–260px, orange @ 5% opacity),
    │                            absolutely positioned top-right, clipped by the frame's
    │                            overflow:hidden, z-index 0 (behind all content)
    ├── Eyebrow Row (z-index 1)
    │   ├── ★ Editor's Pick / ★ Currently Featured  ← REAL signal from `is_featured`,
    │   │      not decoration: a genuine editor's pin reads differently from the
    │   │      recency fallback
    │   ├── (stretching hairline)
    │   ├── Section Diamond   ← ◆ SECTION (sand)
    │   └── Format Chip       ← outlined, format-accent tint
    └── Story Grid (.tg-featured-grid, z-index 1)
        ├── Story Column (left)
        │   ├── Headline      ← post title — LARGER and more extended than any
        │   │                    index/card headline (clamp 32–60px, 116% stretch,
        │   │                    vs. the dispatch row's 56px cap / 112% stretch)
        │   ├── Summary       ← post summary (mono, 14px, capped 520px width)
        │   └── CTA           ← "Read story →" (.tg-btn)
        └── Featured Image Slot (right) ← 16:9 .tg-img-slot placeholder, "★ Cover"
                                            badge overlay (top-left, matches the
                                            PostCard FIG. N badge pattern)
```

Notes:
- Fed by `GET /public/posts/featured` (pin → fallback to most recent). The frontend always normalizes to a full `PublicFeaturedPost` (the recency-fallback case is given `is_featured: false` explicitly in `page.tsx`) so the eyebrow's pin/fallback distinction is never ambiguous.
- The generic "FEATURED" solid-chip badge from the pre-redesign version is gone — the eyebrow now carries that meaning honestly (pin vs. fallback) instead of a decorative label.
- No gutter marker: the band, like all public bands, runs full-width since the rail was removed sitewide.
