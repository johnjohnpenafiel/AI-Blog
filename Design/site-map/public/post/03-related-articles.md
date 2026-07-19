# Post · Section 3 — Related Articles

A two-up card gallery (Stripe-blog-inspired composition, recomposed in the
page's language): each card pairs a framed cover figure with a large
light-Archivo title, clamped summary, and mono section/format chips. The
full-width band below the post grid.

- **Source:** `frontend/src/components/public/related-dispatches.tsx`
- **Data:** up to **2** published posts picked by the page (same section
  first, then most recent — `blog/[slug]/page.tsx`). Band hidden when there
  are none.
- **Background:** `--tg-bg` (hairline-topped band).

## Elements

```
Related Band (.tg-band-sec)
├── "/ Related articles" label (.tg-seclabel)
└── Card Grid (.tg-relgrid — 1fr 1fr; hairline divider between cards)
    └── Card (.tg-relcard → /blog/[slug]; internal grid: figure | body)
        ├── Figure (.tg-relcard-fig — hairline frame)
        │   └── Frame (.tg-relcard-frame — 1:1, ink-black)
        │       └── AI cover <img> (object-fit cover) — or .tg-img-slot
        │           placeholder when image_url is null
        └── Body (.tg-relcard-body — flex column)
            ├── Date kicker (.tg-rel-date + .tg-rel-bullet)  ← "2026.7.17"
            ├── Title (.tg-relcard-title)  ← Archivo 300, clamp(24–34px),
            │       inline ↗ arrow (the home index glyph); text wrapped in
            │       .tg-relcard-hl
            ├── Summary (.tg-relcard-sum)  ← mute, 4-line clamp, pushed to
            │       the bottom (margin-top auto); wrapped in .tg-relcard-hl
            └── Chips (.tg-relcard-chips)  ← mono uppercase SECTION / FORMAT,
                    hairline border
```

Hover: the card's **text floods hot-magenta** (`#ff3d97`, the sanctioned
literal) with ink-black content — `.tg-relcard-hl` spans (title + arrow,
summary) get a magenta highlight (`box-decoration-break: clone`), and the
chips fill magenta. The figure does not react. This is the text-highlight
cousin of the index rows' full-row flood.

Responsive: ≤1100px the grid stacks to one column (the divider becomes a top
hairline); ≤700px each card stacks figure above body.

Note: the shared link-row child classes (`.tg-rel-date`, `.tg-rel-bullet`,
`.tg-rel-title`, `.tg-rel-arrow`) now serve the Sources rows and this card's
date kicker — the old `.tg-rel-row` link-row itself is retired.
