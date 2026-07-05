# Post · Section 2 — Article Body

The rendered markdown of the dispatch itself.

- **Source:** band in `frontend/src/app/(public)/blog/[slug]/page.tsx`; renderer `frontend/src/components/public/dispatch-body.tsx`
- **Gutter marker:** `(01)`

## Elements

```
Article Body band
└── Prose (.tg-prose)          ← ReactMarkdown (+ GFM) output; all styling comes from
                                  .tg-prose element selectors in public-theme.css
    ├── Body paragraphs        ← Archivo editorial voice
    ├── Headings
    ├── Point Lists            ← mono, orange ">" markers
    ├── Pull Quotes            ← orange-rule blockquotes
    └── Links (.tg-body-link style)
```

Notes:
- No per-element wrappers — to change how an element of the article reads (lists, quotes, headings), edit the `.tg-prose` selectors in `public-theme.css`.
