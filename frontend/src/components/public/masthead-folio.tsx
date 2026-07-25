"use client";

import { usePathname } from "next/navigation";

/**
 * Homepage-only folio — the date TAB hung from the masthead's bottom rule.
 *
 * Lives in the pinned header (NOT the scrolling page content) so the
 * masthead's cutoff line never disappears on scroll, and OUTSIDE the
 * homepage's `.tg-home { zoom: 0.8 }` scope so the 3px contour rasterizes
 * at true pixel scale — crisp, and matching the frame/rule weight exactly.
 *
 * The row draws the WHOLE cutoff line as one contour (the brand block's own
 * rule is transparent on the homepage): a flex-filler flat from the left
 * frame wall, then a fixed-coordinate SVG shoulder — a true 45° chamfer
 * (equal 25.92px runs) with both vertices eased by r≈5 quads — landing on
 * the tab's straight underline out to the right wall. All geometry is
 * authored 1:1 (the ChamferedPanel principle): the SVG is exactly 50×36,
 * the row is exactly 36px tall, no viewBox stretching, so every joint
 * meets at the same centerline by construction.
 *
 * Hidden ≤768px with the desktop masthead (home-landing renders a flat
 * mobile strip instead). Null on every other route.
 */

/** Long-form edition date, e.g. "Saturday, July 25, 2026". */
function editionDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Next scheduled drop day off the hardcoded Mon/Thu/Fri 08:00 cadence. */
function nextDrop(): string {
  const DROP_DAYS: Record<number, string> = { 1: "Mon", 4: "Thu", 5: "Fri" };
  const now = new Date();
  for (let i = 0; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const label = DROP_DAYS[d.getDay()];
    if (label && (i > 0 || now.getHours() < 8)) return label;
  }
  return "Mon";
}

export function MastheadFolio() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <div className="tg-folio">
      <span className="tg-folio-line" aria-hidden="true" />
      <span className="tg-folio-right">
        <svg
          className="tg-folio-shoulder"
          width="50"
          height="36"
          viewBox="0 0 50 36"
          aria-hidden="true"
        >
          {/* Pocket fill first (the tab-interior wedge above the contour),
              then the stroke on top of it. */}
          <path
            className="tg-shoulder-fill"
            d="M0 0 L0 1.5 L2 1.5 Q7 1.5 10.54 5.04 L36.46 30.96 Q40 34.5 45 34.5 L50 34.5 L50 0 Z"
          />
          {/* Top flat (y 1.5) → r≈5 ease → 45° diagonal (Δx = Δy = 25.92)
              → r≈5 ease → bottom flat (y 34.5). Tangents match at every
              joint: horizontal in, 45° through, horizontal out. */}
          <path
            className="tg-shoulder-line"
            d="M0 1.5 L2 1.5 Q7 1.5 10.54 5.04 L36.46 30.96 Q40 34.5 45 34.5 L50 34.5"
          />
        </svg>
        <span className="tg-folio-date" suppressHydrationWarning>
          {editionDate()}
        </span>
        <span className="tg-folio-drop" suppressHydrationWarning>
          Next drop {nextDrop()} 08:00
        </span>
      </span>
    </div>
  );
}
