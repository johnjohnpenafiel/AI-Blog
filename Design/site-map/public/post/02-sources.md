# Post · Section 2 — Sources

The editorial contract: every dispatch lists its sources. Not part of the
Post v2 canvas — kept and recomposed in the page's link-row language (the
same family as the Related-articles rows).

Lives **inside the article column** (`.tg-artcol`, rendered by `PostView`
after the prose), not as a standalone band: it scrolls with the article and
shares the prose's 820px measure (`.tg-artcol .tg-band-sec` drops the band's
24px inset and caps the width). Related-articles remains a full-width band
below the post grid.

- **Source:** `frontend/src/components/public/sources-list.tsx` (rendered
  from `post-view.tsx`)
- **Background:** `--tg-bg` (hairline-topped).

## Elements

```
Sources Band (.tg-band-sec)
├── "/ Sources" label (.tg-seclabel)
└── Source Row (.tg-src-row → source URL, new tab; 150px | 1fr | auto | 32px grid)
    ├── Date (.tg-rel-date + .tg-rel-bullet)  ← "2026.5.19", orange-deep square
    │                                            (falls back to "01" index when
    │                                            the source has no date)
    ├── Title (.tg-rel-title)  ← Archivo 300, one-line ellipsis
    ├── Publisher (.tg-src-pub)  ← mono faint uppercase, right-aligned
    │                              (hidden ≤700px)
    └── Arrow (.tg-rel-arrow)  ← ↗, faint
```

Hover: row floods `#ff3d97` (the sanctioned magenta literal); all content
flips to ink-black — identical behavior to the related rows.

Empty state: `// No sources listed` (mono faint).
