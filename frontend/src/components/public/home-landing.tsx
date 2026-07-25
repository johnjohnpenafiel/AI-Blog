import Link from "next/link";

import type { PublicFeaturedPost, PublicPostListItem } from "@/lib/public-api";

import { DispatchCard } from "./dispatch-card";

/**
 * Homepage landing — the bands above the Blog index, composed as a
 * broadsheet FRONT PAGE rather than a website hero:
 *
 * 1. Standfirst manifesto — the publication's voice on the blockquote
 *    orange rule, signed "— The Garage Desk", About as an inline link.
 *    (The desktop date TAB lives in the pinned masthead — masthead-folio.tsx;
 *    here only the ≤768px flat date strip renders.)
 * 2. Spotlight — "/ Featured post" beside "/ Latest post" as console-window
 *    dispatch cards split by a centered dashed divider.
 *
 * Renders nothing pre-launch (no published posts) — the Blog index's empty
 * state owns the page then.
 */

/** Long-form edition date for the mobile strip, e.g. "Monday, July 21, 2026". */
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

export function HomeLanding({
  featured,
  latest,
}: {
  featured: PublicFeaturedPost | null;
  latest: PublicPostListItem | null;
}) {
  if (!featured) return null;
  return (
    <div className="tg-home">
      {/* ≤768px only — the flat edition strip under the mobile masthead bar
          (the desktop tab is masthead-folio.tsx, hidden with the desktop
          masthead). */}
      <div className="tg-folio-mobile">
        <span suppressHydrationWarning>{editionDate()}</span>
        <span suppressHydrationWarning>Next drop {nextDrop()} 08:00</span>
      </div>

      {/* Standfirst — the publication's voice on the article-blockquote
          orange rule, set as a newspaper lede (title + deck upper-left,
          signature line grounding the bottom) around a MONUMENT: "BLOG" as
          a 2×2 monogram tile — BL over OG — in a faint outline stroke,
          bleeding off the band's bottom-right like a schematic watermark. */}
      <div className="tg-home-manifesto">
        <div className="tg-manifesto-ghost" aria-hidden="true">
          <span>BL</span>
          <span>OG</span>
        </div>
        <h2 className="tg-manifesto-title">
          AI is the new dealership operating system.
        </h2>
        <p className="tg-manifesto-text">
          Every dealership runs on software now — the question is whose, and
          whether it works. We track the AI that actually moves metal, fixes
          cars, and keeps customers; the vendor noise gets called what it
          is.
          <span className="tg-cadence-line">
            <span className="tg-home-neon-cyan">The Brief</span> lands
            Monday.
          </span>
          <span className="tg-cadence-line">
            <span className="tg-home-neon-magenta">The Deep Dive</span>,
            Thursday.
          </span>
          <span className="tg-cadence-line">
            <span className="tg-home-neon-green">The Roundup</span>, Friday.
          </span>
        </p>
        <div className="tg-manifesto-foot">
          <span className="tg-manifesto-sig">— The Garage Desk</span>
          <span className="tg-manifesto-about">
            First time in the garage?{" "}
            <Link href="/about" className="tg-body-link">
              Read what we&apos;re about
            </Link>
          </span>
        </div>
      </div>
      {/* Flat grid: the two labels are row 1 (their borders join into one
          straight full-width rule), the two cards row 2. The ≤1100px stack
          re-interleaves them with `order`. */}
      <div className="tg-home-spot">
        <div className="tg-home-label">/ Featured post</div>
        <div className="tg-home-label">/ Latest post</div>
        <section className="tg-home-cell">
          <DispatchCard post={featured} imageUrl={featured.image_url} />
        </section>
        <section className="tg-home-cell">
          {latest ? (
            <DispatchCard post={latest} imageUrl={latest.image_url} />
          ) : (
            <div className="tg-home-empty">
              {"// Nothing else yet — the next dispatch lands Monday at 08:00"}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
