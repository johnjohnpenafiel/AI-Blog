# Page — /dashboard/queue (Review Queue)

- **Sources:** `frontend/src/app/dashboard/queue/page.tsx`, `components/dashboard/queue/*`

## Sections

```
Queue
├── // 01 Pending Review (SectionHeader)
├── Queue Card List (scrolls; header + pagination stay pinned)
│   └── Queue Card (×N — minimal triage index, whole card opens the Review Panel)
│       ├── Taxonomy Row        ← SECTION · FORMAT
│       ├── Attempt Flag        ← "ATTEMPT N" when regenerated
│       ├── Card Title
│       └── Card Footer Band    ← Generated date · Eval Badge (left) · "REVIEW →" (right)
├── Pagination
└── Queue Empty State           ← "// No posts pending review"
```

## Review Panel (overlay — opens from a Queue Card)

- **Source:** `components/dashboard/queue/review-panel.tsx`

```
Review Panel (full-screen backdrop + structural ChamferedPanel)
├── Panel Header
│   ├── Review Label            ← "// Review (· Attempt N)"
│   ├── Post Title
│   ├── Generated Timestamp
│   ├── Taxonomy Meta
│   └── Close Button (✕)
├── Panel Body (scrolls)
│   ├── Markdown Preview        ← the post as it would render (MarkdownBody;
│   │                              MarkdownSkeleton while regenerating)
│   ├── Generation Eval section ← Eval Badge + POV/Format/Grounding scores + eval notes
│   └── Sources section         ← "SOURCES [N]" + linked source items
└── Action Bar (sticky footer)
    ├── Accept Button           ← opens the Accept Modal
    ├── Reject Button           ← two-step confirm (Reject → Confirm reject / Cancel)
    ├── Regenerate Button       ← swaps the bar for the Regenerate Form
    ├── Regenerate Form         ← optional-feedback textarea + submit/cancel
    └── Action Error Line
```

## Accept Modal (nested, from Accept)

- **Source:** `components/dashboard/queue/accept-modal.tsx`
- **Publish Now** option · **Schedule For Later** (date/time picker) · Confirm / Cancel.
