import type { PublicFeaturedPost, PublicPostListItem } from "@/lib/public-api";

import { DispatchCard } from "./dispatch-card";

/**
 * Homepage landing — the bands above the News index.
 *
 * The masthead wordmark already crowns the page with the site's name, so
 * there is no "Welcome to …" headline; the landing opens straight on a large
 * editorial lede saying what the site is (mute Archivo, the operative phrase
 * in sand — the thesis-line voice). Below it, a two-up spotlight:
 * "/ Featured post" (the editor's pin, or the most-recent fallback) beside
 * "/ Latest post" (the newest dispatch that isn't already featured), both as
 * console-window dispatch cards split by a vertical hairline.
 *
 * Renders nothing pre-launch (no published posts) — the News index's empty
 * state owns the page then.
 */
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
      <div className="tg-home-intro">
        <p className="tg-home-lede">
          Three dispatches a week on the AI reshaping how automotive
          dealerships <span className="tg-home-neon-cyan">sell</span>,{" "}
          <span className="tg-home-neon-magenta">service</span>, and{" "}
          <span className="tg-home-neon-green">operate</span> — written for
          the operators running the store, not the hype cycle.
        </p>
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
