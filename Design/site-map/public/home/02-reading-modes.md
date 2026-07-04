# Home · Section 2 — Reading Modes

"How do you want to read?" — the four formats as selectable preference cards; picking one shows the latest dispatches of that format below.

- **Source:** `frontend/src/components/public/reading-modes.tsx`
- **Gutter marker:** `(*)`
- **Background:** lifted band background (alternating stripe).

## Elements

```
Reading Modes band
├── Prompt Label          ← "HOW DO YOU WANT TO READ?" (mono)
├── Mode Grid             ← 4 Mode Cards in one framed grid (.tg-mode-grid)
│   └── Mode Card (×4)    ← Brief "2-Minute Intel" / Deep Dive "Go Further" /
│       │                    Roundup "The Week" / Explainer "Start Here"
│       ├── Accent Spine  ← 2px vertical bar, lights with the mode's accent
│       ├── Mode Label    ← display name ("2-Minute Intel")
│       ├── Mode Tag      ← format token, accent color ("● BRIEF" when active)
│       ├── Mode Sub      ← cadence line ("Monday drops")
│       └── Mode Desc     ← one-sentence description
└── Mode Results
    ├── Results Rule Header  ← pulse dot · "LATEST IN {mode}" · hairline · count + cadence
    ├── Post Card Grid       ← up to 4 Post Cards for the active format (.tg-post-grid)
    │                           (Post Card anatomy → components.md)
    └── Empty State          ← "// No {FORMAT} dispatches yet" when the format has no posts
```

Notes:
- State: one active mode at a time; default **Brief**. Hover and active both light the card.
- Each mode carries its own accent color, which also tints the Post Cards below it.
