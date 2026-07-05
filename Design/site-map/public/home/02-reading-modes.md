# Home · Section 2 — Reading Modes

"How do you want to read?" — the four formats as a **vertical** selectable filter list on the left; picking one drives a **horizontal (sideways-scrolling) carousel** of that format's latest dispatches — portrait cards — on the right. Both halves live inside **one bordered console** (`.tg-rm-console`), divided by a single hairline, so the section reads as one module rather than two floating parts.

- **Source:** `frontend/src/components/public/reading-modes.tsx`
- **Background:** base band background (`--tg-bg`, dark) — first in the alternating stripe sequence.
- **Layout:** `.tg-rm-console` (1px `--tg-frame` border) wraps `.tg-rm-layout` (`minmax(280px,340px) | 1fr` grid, `align-items: stretch` — the filter column always matches the carousel column's height). The filter column carries a `border-right` divider instead of its own separate border. Collapses ≤720px: console stays, filters become a **2×2 grid** (the original pre-carousel mobile treatment) with a `border-bottom` divider instead, carousel full-width below.
- **The console height is CONSTANT — the core invariant.** The stage block is fully deterministic in every state: carousel cards have a **fixed height** (`--rm-card-h: 450px` on `.tg-rm-stage`; internal line-clamps + `overflow: hidden` + max-2-tags absorb content variance), the **controls row is always rendered** (`visibility: hidden` when there's ≤1 card — hidden, not removed, so its 32px stays reserved), and the **empty state** (`.tg-rm-empty`) is sized to the carousel block's exact footprint (`card + 64px` = viewport padding + gap + controls). Result: the console renders at the same height with 0, 1, or 5 posts. Because the target height never moves, the filter cards can safely `flex: 1 1 auto` to share it — they render identical in every state and no leftover strip is ever exposed. (Two earlier attempts fixed only the filter side — grow-to-fill made cards resize with carousel content; fixed-size cards left a dead strip below the last one. Both were symptoms of the same root cause: the carousel column's height varied. This fix removes the variance itself.)

## Elements

```
Reading Modes band
├── Prompt Label          ← "HOW DO YOU WANT TO READ?" (mono)
└── Console (.tg-rm-console — single bordered module)
    └── Layout (.tg-rm-layout)
        ├── Filters (left, .tg-rm-filters — vertical stack, 1px hairline
        │   │         dividers between cards, border-right divides from stage)
        │   └── Mode Card (×4) ← Brief "2-Minute Intel" / Deep Dive "Go Further" /
        │       │                 Roundup "The Week" / Explainer "Start Here"
        │       ├── Accent Spine ← 2px vertical bar, lights with the mode's accent
        │       ├── Mode Label   ← display name ("2-Minute Intel") — the ONLY
        │       │                   identifying text; no format-token badge
        │       └── Mode Desc    ← one-sentence description (hidden on mobile)
        └── Stage (right, .tg-rm-stage)
            ├── Results Rule Header ← pulse dot · "LATEST IN {mode}" · hairline ·
            │                          boxed count token (echoes the filter-chip
            │                          count idiom elsewhere on the site)
            ├── Carousel (.tg-rm-carousel — viewport + control row)
            │   ├── Viewport (.tg-rm-viewport) ← sideways scroll-snap row of PORTRAIT
            │   │     cards; centered card emphasized, left/right neighbors peek + dim;
            │   │     edge mask softens the peeked cards
            │   │   └── Carousel Card (×N, .tg-rm-card — FIXED height --rm-card-h)
            │   │         ← image slot on top (16:10); below: meta (date · read),
            │   │           3-line title, 3-line summary, up to 2 `>` tag points
            │   └── Controls (.tg-rm-controls) ← ‹ prev · diamond dot per card · next ›
            │         (always rendered; visibility:hidden when ≤1 card so the
            │          reserved height never changes)
            └── Empty State ← "// No {FORMAT} dispatches yet" when the format has no posts
```

## What was cut, and why

The original build carried publishing-schedule detail on each filter card ("Monday drops", "Thursday deep dives", …) and repeated it a second time in the carousel's results header ("03 BRIEF · Monday drops"). That's process information — which day a format drops — not a reading preference; a reader choosing "how do I want to read this" doesn't need to know the cadence, and the site's `/about` page already covers it. Also cut: the mode card's top-right format-token badge (e.g. "● BRIEF") and its active-state "●" dot, which duplicated a selection signal the card's border/background/spine already gave — and the card's border itself, since background tint + spine is a cleaner single signal than border + tint + spine stacked together.

What each filter card carries now: **the name, and one sentence on what it's for.** Nothing else.

## The carousel

- **Horizontal, native CSS scroll-snap** (`scroll-snap-type: x mandatory`, `overscroll-behavior-x: contain`) — trackpad / touch swiping is native and smooth, no scroll-hijacking. Scrollbar hidden.
- **Card width** is CSS-only (`--rm-card-w: min(300px, 78vw)`) with symmetric side padding (`calc(50% - card/2)`) so the first & last card can scroll to center. On a wide stage several portrait cards show at once (a gallery); the centered one is emphasized, the rest recede.
- **Active card** = the one crossing a thin vertical center band, detected by an `IntersectionObserver` (`rootMargin: 0 -47% 0 -47%`). Active is full opacity + accent border + `scale(1)`; inactive cards are dimmed (`opacity 0.42`) and `scale(0.93)`, all transitioned for smoothness.
- **Controls:** prev/next arrow buttons (‹ ›, disabled at the ends) and a horizontal diamond **dot row**, both call `centerCard` — a viewport-only horizontal scroll (never `scrollIntoView`, which could scroll the whole page to reach the band). Responsive, no JS geometry constants. Dots echo the ◆ diamond idiom (no circles).
- **Opens on card #2** (index 1) when there are ≥2 dispatches, so a card peeks on both sides and the gallery reads as full from the start (falls back to card 1). Centered on mount via a viewport-only scroll — no page movement.
- **Mode change** remounts the carousel (`key={activeId}`) → fresh start, no reset effect.
- Reduced-motion: transitions/animations off, cards rest un-scaled.

Notes:
- State: one active mode at a time; default **Brief**. Hover and active both light the filter card.
- Each mode carries its own accent color, which tints the active carousel card's border, the meta line, and the dot rail.
- Up to 5 dispatches per format feed the carousel.
- The card image slots are the sanctioned `.tg-img-slot` placeholders — kept on mobile here (unlike the other slots), since the portrait card gallery is defined by them.
- The `Mode.tag` field (e.g. `"BRIEF"`) still exists in the data — it's used only in the empty-state copy ("// No BRIEF dispatches yet"), not displayed anywhere else.
