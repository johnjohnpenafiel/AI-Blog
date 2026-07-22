import Link from "next/link";

import type { PublicFeaturedPost, PublicPostListItem } from "@/lib/public-api";

import { DispatchCard } from "./dispatch-card";

/**
 * Homepage landing — the bands above the Blog index, composed as a
 * broadsheet FRONT PAGE rather than a website hero:
 *
 * 1. Folio — the thin data line under the flag (nameplate): volume + live
 *    dispatch number, motto, today's date, next drop. Publications carry
 *    edition data where websites put hero copy.
 * 2. Standfirst manifesto — the publication's voice on the blockquote
 *    orange rule, signed "— The Garage Desk", About as an inline link.
 * 3. Spotlight — "/ Featured post" beside "/ Latest post" as console-window
 *    dispatch cards split by a centered dashed divider.
 *
 * Renders nothing pre-launch (no published posts) — the Blog index's empty
 * state owns the page then.
 */

/** Content-engine generation shown in the folio (bump when the pipeline
    meaningfully changes — v2 = the multi-format taxonomy engine). */
const PIPELINE_VERSION = "v2.0";

/** Folio volume = publication year: Vol. 01 = 2026, Vol. 02 = 2027, … */
function volume(): string {
  return String(new Date().getFullYear() - 2025).padStart(2, "0");
}

/** Long-form edition date for the folio, e.g. "Monday, July 21, 2026". */
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
  total,
}: {
  featured: PublicFeaturedPost | null;
  latest: PublicPostListItem | null;
  /** Published dispatch count — the folio's edition number. */
  total: number;
}) {
  if (!featured) return null;
  return (
    <div className="tg-home">
      {/* Folio — the broadsheet data line under the flag: volume + live
          dispatch number, the motto, today's date, and the next drop off the
          Mon/Thu/Fri cadence. Edition data, not marketing copy. */}
      <div className="tg-folio">
        <span>
          Vol. {volume()} · No. {String(total).padStart(2, "0")} ·{" "}
          {PIPELINE_VERSION}
        </span>
        <span className="tg-folio-right">
          <span className="tg-folio-date">{editionDate()}</span>
          <span className="tg-folio-drop">
            <span className="tg-folio-dot tg-pulse" aria-hidden="true" />
            Next drop {nextDrop()} 08:00
          </span>
        </span>
      </div>

      {/* Mobile-only greeting (≤768px): the desktop masthead's welcome hero
          doesn't exist there, so a plain welcome line follows the folio. */}
      <p className="tg-home-mwelcome">
        Welcome to <span className="tg-home-mwelcome-brand">The Garage AI</span>.
      </p>

      {/* Standfirst — the publication's voice on the article-blockquote
          orange rule, signed. About is an inline text link, not a button. */}
      <div className="tg-home-manifesto">
        <div className="tg-manifesto-kicker">{"// From the Garage desk"}</div>
        <h2 className="tg-manifesto-title">
          AI is the new dealership operating system.
        </h2>
        <p className="tg-manifesto-text">
          Every dealership runs on software now — the question is whose, and
          whether it works. We track the AI that actually moves metal, fixes
          cars, and keeps customers; the vendor noise gets called what it is.{" "}
          <span className="tg-home-neon-cyan">The Brief</span> lands Monday.{" "}
          <span className="tg-home-neon-magenta">The Deep Dive</span>,
          Thursday. <span className="tg-home-neon-green">The Roundup</span>,
          Friday.
        </p>
        <div className="tg-manifesto-sig">— The Garage Desk</div>
        <p className="tg-manifesto-about">
          First time in the garage?{" "}
          <Link href="/about" className="tg-body-link">
            Read what we&apos;re about
          </Link>
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
