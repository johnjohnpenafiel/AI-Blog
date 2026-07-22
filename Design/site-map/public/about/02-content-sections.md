# About · Section 2 — Spec-Sheet Bands + CTA

Six `/ Label` seclabel bands after the hero (the machine's "spec sheet"),
then a single CTA row. Every band opens with the shared `.tg-seclabel`
idiom (mono label, full-width rule below).

- **Source:** `frontend/src/app/(public)/about/page.tsx` (data arrays →
  `.tg-about-band` sections)

## The bands (in order)

| Seclabel | Anatomy |
|---|---|
| `/ The beat` | h2 + copy, then the six-department grid (`.tg-about-depts`: 3-col mono list, orange-deep square bullets, hairline row rules) and the struck "Not on the beat:" line (`.tg-about-not`) |
| `/ The machine` | h2 + copy, then six assembly-line rows (`.tg-about-steps`: orange `01` counter · mono step name · editorial description) and the mono sand close line (`.tg-about-step-out`: "→ On the site by 08:00 · Sources listed · Human edits: 0") |
| `/ The cadence` | h2, then three columns split by dashed-mute verticals (`.tg-about-cadence`): mono day/time kicker, format name wearing the homepage **neon triad** (`.tg-home-neon-*` — scope extended here, see decisions log), description |
| `/ The point of view` | The manifesto blockquote voice (`.tg-about-pov`: 3px orange left rule): h2 + copy, signed "— The Garage Desk" in mono sand (`.tg-about-sig`) |
| `/ The contract` | Four §-numbered clause rows (`.tg-about-clauses`: sand `§01` counter · bold title + muted text, hairline splits) |
| `/ The garage` | h2 + copy — "Mechanics, not authors": the humans tune the machine, the machine writes (deliberately headcount-free) |

## CTA (page close)

```
CTA row (.tg-about-cta)
├── Mono line          ← "// Enough about the machine" (faint)
└── Ghost button       ← "Read the latest dispatch →" (.tg-btn recipe, links "/")
```

Notes:
- Data-driven: departments / steps / cadence / clauses are arrays in
  `page.tsx` — adding an entry is a one-line change.
- ≤820px: grids stack to one column, the cadence's dashed verticals become
  dashed row rules, step descriptions drop under the step name.
