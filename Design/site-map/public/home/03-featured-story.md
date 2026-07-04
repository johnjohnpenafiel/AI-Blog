# Home · Section 3 — Featured Story

The cover dispatch shown large: the editor's-choice pin if one exists, else the most-recent post.

- **Source:** `frontend/src/components/public/featured-story.tsx`
- **Gutter marker:** `(★)` — orange.
- **Layout:** two equal columns (Story Column | Featured Image Slot).

## Elements

```
Featured Story band
├── Story Column (left)
│   ├── Badge Row
│   │   ├── Section Diamond    ← ◆ SECTION (orange)
│   │   ├── Format Chip        ← outlined, format-accent tint
│   │   └── Featured Chip      ← "FEATURED", solid orange fill
│   ├── Headline               ← post title (display, large)
│   ├── Summary                ← post summary (mono)
│   └── CTA                    ← "Read story →" (.tg-btn)
└── Featured Image Slot (right) ← 16:9 .tg-img-slot placeholder (house imagery, not yet filled)
```

Notes:
- Fed by `GET /public/posts/featured` (pin → fallback to most recent).
