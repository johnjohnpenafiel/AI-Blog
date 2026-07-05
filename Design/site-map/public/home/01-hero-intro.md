# Home · Section 1 — Hero Intro

The index hero: video background, positioning statement on the left, two stacked cards on the right — "Up Next" on top, the animated pipeline readout on the bottom.

- **Source:** `frontend/src/components/public/hero-intro.tsx`
- **Layout:** the band splits into two near-equal halves (`1.08fr 0.92fr` — the left column is slightly wider, which nudges the right half's boundary right). The identity column owns the left region; the card stack (`.tg-hero-cards`, `clamp(340px, 82%, 560px)` wide) **centers itself inside the right region** both horizontally (`justifySelf: center`) and vertically (`alignSelf: center`) — it no longer forces full band height. Wrapper right padding is `--tg-edge`. Collapses to one full-width stacked column ≤860px, cards keep their own borders.
- **Two independent cards, not one strip.** Each card (`.tg-hero-card`) is fully bordered (`--tg-frame`) on all four sides with padding all around (`26px 28px 28px`), separated by a `20px` gap — a "grid column" look, each with room to breathe, rather than one continuous architectural strip running edge to edge. The card-stack wrapper also carries `20px` top/bottom padding, matching the inter-card gap, so spacing is even: top of stack → card → gap → card → bottom of stack.
- **Legibility over the video:** each card's fill is near-opaque (`rgba(10,10,10,0.85)` + blur) — the video reads only as a whisper behind it — and `.tg-hero-shade` protects **both** ends of the band (heavy left for the headline, moderate right so the video's bright edge doesn't clash with the cards).

## Elements

```
Hero Intro band
├── Hero Video            ← /hero.mp4, autoplaying background
├── Hero Shade             ← dual-ended protection gradient over the video
├── Identity Column (left, carries its own 40/44px vertical padding)
│   ├── Kicker             ← "Operator-First · Proof-Over-Hype" (sand)
│   ├── Headline           ← "AI is remaking / the dealership." (display, 2 lines)
│   ├── Subline            ← one-sentence positioning paragraph
│   └── CTA Row            ← Primary "Read the latest →" (.tg-btn) + Ghost "Browse the index ↓"
│                             (ghost CTA anchors to #dispatch-index)
└── Card Stack (right, .tg-hero-cards — flex column, 20px gap, vertically centered)
    ├── Card 1 — Up Next (top)        ← plain type stack: "Up Next" label (orange
    │                                    mono) → next drop's format name LARGE in
    │                                    extended Archivo (28–38px) → "MONDAY · 08:00"
    │                                    (format accent). Live from
    │                                    computeWeekSchedule: first upcoming slot this
    │                                    week, else next Monday's Brief
    │                                    ("Up Next · Next Week").
    └── Card 2 — The Pipeline (bottom) ← "The Pipeline" label (sand mono), then the
                                          animated diagram (.tg-pipe): vertical spine,
                                          four diamond stage nodes (Scan → Filter →
                                          Write → Drop), mono title (11px) + one-line
                                          description (10px mute) per stage.
```

## The pipeline animation

One synchronized 9-second cycle (all keyframes share a single timeline — no `animation-delay`):

1. An orange **spark** (`.tg-pipe-runner`, rotated square) descends the spine, with a lit **trail** (`.tg-pipe-trail`) growing in lockstep behind it — the trail animates `scaleY` (not `height`) so it interpolates reliably and the spark never detaches from it.
2. Each stage **node flares** (solid orange + glow) as the spark passes — pass-by at ~2% / 29% / 58% / 83% of the cycle — then settles to a warm translucent-orange "**visited**" state.
3. Stage **titles brighten** mute → ink in the same rhythm (title inherits the stage container's animated color; descriptions stay mute).
4. At 92% the spark reaches bottom; by 100% everything resets and the run begins again.

Per-stage keyframes live in `public-theme.css` (`tg-pipe-stage-a…d`, `tg-pipe-node-a…d`). Under `prefers-reduced-motion` the spark and trail are removed and nodes/titles rest statically in the visited/lit state. The spine/trail height is driven by the pipeline card's actual content height (no forced full-height stretch), since the card now sizes to its content rather than filling a strip.

Notes:
- **Deliberately plain inside each card:** no stretching hairlines after labels, no dotted leaders, no heat gradients, no sign-off marks — earlier drafts stacked those and read as clutter over the busy video.
- Pipeline stage nodes are **diamonds** (rotated squares) — echoing the ◆ section-diamond idiom and keeping the no-circles rule.
- Up Next is not a link (the post doesn't exist yet).
- Elements animate in with staggered `.tg-fade-up`.
- The **cover post** (linked from the primary CTA) is always the newest published post, independent of the Featured pin. It is deliberately not re-displayed inside the hero band — the Featured Story band and the top of the Dispatch Index already surface it.
- No gutter marker: the band, like all public bands, runs full-width since the rail was removed sitewide.
