# Home · Section 2 — Reading Modes

"How do you want to read?" — the four formats as a **vertical** selectable filter list on the left; picking one drives a **horizontal (sideways-scrolling) carousel** of that format's latest dispatches — portrait cards — on the right.

- **Source:** `frontend/src/components/public/reading-modes.tsx`
- **Background:** base band background (`--tg-bg`, dark) — first in the alternating stripe sequence.
- **Layout:** two-column grid (`.tg-rm-layout`, `minmax(300px,380px) | 1fr`, 44px gap). The filter panel is given real width for balance; the carousel stage takes the larger share. Collapses to one column ≤720px (filters become a swipeable horizontal row, carousel full-width below).

## Elements

```
Reading Modes band
├── Prompt Label          ← "HOW DO YOU WANT TO READ?" (mono)
└── Layout (.tg-rm-layout)
    ├── Filters (left, .tg-rm-filters — vertical stack, 1px hairline dividers)
    │   └── Mode Card (×4) ← Brief "2-Minute Intel" / Deep Dive "Go Further" /
    │       │                 Roundup "The Week" / Explainer "Start Here"
    │       ├── Accent Spine ← 2px vertical bar, lights with the mode's accent
    │       ├── Mode Label   ← display name ("2-Minute Intel")
    │       ├── Mode Tag     ← format token, accent color ("● BRIEF" when active)
    │       ├── Mode Sub     ← cadence line ("Monday drops")
    │       └── Mode Desc    ← one-sentence description (hidden on mobile)
    └── Stage (right, .tg-rm-stage)
        ├── Results Rule Header ← pulse dot · "LATEST IN {mode}" · hairline · count + cadence
        ├── Carousel (.tg-rm-carousel — viewport + control row)
        │   ├── Viewport (.tg-rm-viewport) ← sideways scroll-snap row of PORTRAIT
        │   │     cards; centered card emphasized, left/right neighbors peek + dim;
        │   │     edge mask softens the peeked cards
        │   │   └── Carousel Card (×N, .tg-rm-card) ← image slot on top (16:10);
        │   │         below: meta (date · read), 3-line title, 3-line summary,
        │   │         up to 3 `>` tag points
        │   └── Controls (.tg-rm-controls) ← ‹ prev · diamond dot per card · next ›
        └── Empty State ← "// No {FORMAT} dispatches yet" when the format has no posts
```

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
