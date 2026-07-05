import Link from "next/link";

import type { PublicPostListItem } from "@/lib/public-api";
import { formatAccent } from "@/lib/public-format";
import type { WeekSchedule } from "@/lib/week-schedule";

/**
 * Intro band — the index hero. Solid dark background (the video background
 * was pulled for now — revisit later). The left column is the publication's
 * positioning statement.
 *
 * The right side (Up Next + The Pipeline animation, a two-card stack) is
 * PARKED, not deleted — flip `SHOW_HERO_CARDS` to bring it back:
 *   1. UP NEXT (top) — the next scheduled drop (live from
 *      `computeWeekSchedule`): label, format name large in extended Archivo,
 *      day · time.
 *   2. THE PIPELINE (bottom) — an animated readout of how the site makes itself
 *      (scan → filter → write → drop). One 9s synchronized cycle: an orange
 *      spark descends the spine leaving a lit trail; each diamond node flares
 *      as the spark passes and stays warm ("visited") until the cycle resets.
 *      Stage titles brighten in the same rhythm. Pure CSS (`.tg-pipe*`),
 *      fully static under prefers-reduced-motion.
 *
 * The hero deliberately does NOT re-show the latest post (that headlines the
 * Featured band and tops the Dispatch Index below).
 */

/** Parked for now (video background removed, cards hidden) — flip to restore. */
const SHOW_HERO_CARDS = false;

/** The automated pipeline, one line per stage — the strip's moving diagram. */
const PIPELINE = [
  { title: "Scan", desc: "Perplexity sweeps the week's dealership-AI wires" },
  { title: "Filter", desc: "A classifier cuts promo noise and ranks what matters" },
  { title: "Write", desc: "Claude drafts the dispatch in the operator voice" },
  { title: "Drop", desc: "Published Mon · Thu · Fri at 08:00" },
];

const DAY_NAMES: Record<string, string> = {
  MON: "Monday",
  THU: "Thursday",
  FRI: "Friday",
};

export function HeroIntro({
  coverPost,
  weekSchedule,
}: {
  coverPost: PublicPostListItem;
  weekSchedule: WeekSchedule;
}) {
  // The next drop: the first slot still to come this week, or next Monday's
  // Brief once the week is done.
  const upcoming = weekSchedule.slots.find((s) => s.status === "upcoming");
  const focal = upcoming ?? { day: "MON", format: "Brief" };
  const nextWeek = !upcoming;
  const accent = formatAccent(focal.format);

  return (
    <div
      className="tg-band"
      style={{
        position: "relative",
        background: "var(--tg-bg)",
        borderBottom: "1px solid var(--tg-frame-hair)",
        overflow: "hidden",
      }}
    >
      {/* no vertical padding on the wrapper — the left column carries its own
          breathing room. The card stack (when shown) centers itself in the
          right half; hidden, the identity column just runs full width. */}
      <div
        className="tg-hero-grid tg-band-content"
        style={{
          position: "relative",
          zIndex: 1,
          paddingRight: SHOW_HERO_CARDS ? "var(--tg-edge)" : undefined,
          display: "grid",
          gridTemplateColumns: SHOW_HERO_CARDS
            ? "1.08fr 0.92fr"
            : "minmax(0, 1fr)",
        }}
      >
        {/* ── left: positioning statement ─────────────────────────────────── */}
        <div style={{ padding: "40px 0 44px" }}>
          <div className="tg-fade-up" style={{ marginBottom: 18, animationDelay: "0.04s" }}>
            <span
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                color: "var(--tg-sand)",
                textTransform: "uppercase",
              }}
            >
              {"Operator-First · Proof-Over-Hype"}
            </span>
          </div>
          <h1
            className="tg-fade-up"
            style={{
              fontFamily: "var(--tg-font-display)",
              fontWeight: 700,
              fontStretch: "118%",
              fontSize: "clamp(38px, 5.2vw, 76px)",
              lineHeight: 0.96,
              letterSpacing: "-0.02em",
              color: "var(--tg-ink)",
              margin: "0 0 24px",
              animationDelay: "0.05s",
            }}
          >
            AI is remaking
            <br />
            the dealership.
          </h1>
          <p
            className="tg-fade-up"
            style={{
              fontFamily: "var(--tg-font-display)",
              fontWeight: 400,
              fontStretch: "112%",
              fontSize: 18,
              lineHeight: 1.5,
              letterSpacing: "0.002em",
              color: "var(--tg-mute)",
              maxWidth: 468,
              margin: "0 0 30px",
              animationDelay: "0.1s",
            }}
          >
            The operator&apos;s brief on artificial intelligence across every
            dealership department — sales, service, inventory, and the back
            office. Three dispatches a week. Proof over hype.
          </p>
          <div
            className="tg-fade-up"
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
              animationDelay: "0.16s",
            }}
          >
            <Link href={`/blog/${coverPost.slug}`} className="tg-btn">
              Read the latest →
            </Link>
            <Link href="#dispatch-index" className="tg-btn-ghost">
              Browse the index ↓
            </Link>
          </div>
        </div>

        {/* ── right: two stacked cards, parked for now — SHOW_HERO_CARDS ──── */}
        {SHOW_HERO_CARDS && (
        <div
          className="tg-fade-up tg-hero-cards"
          style={{
            justifySelf: "center",
            alignSelf: "center",
            width: "clamp(340px, 82%, 560px)",
            padding: "20px 0",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            animationDelay: "0.18s",
          }}
        >
          {/* card 1 — up next */}
          <div
            className="tg-hero-card"
            style={{
              border: "1px solid var(--tg-frame)",
              background: "rgba(10,10,10,0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              padding: "26px 28px 28px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 9.5,
                letterSpacing: "0.2em",
                color: "var(--tg-orange)",
                textTransform: "uppercase",
              }}
            >
              {nextWeek ? "Up Next · Next Week" : "Up Next"}
            </div>
            <div
              style={{
                fontFamily: "var(--tg-font-display)",
                fontWeight: 700,
                fontStretch: "115%",
                fontSize: "clamp(28px, 2.6vw, 38px)",
                lineHeight: 1,
                letterSpacing: "-0.01em",
                color: "var(--tg-ink)",
                textTransform: "uppercase",
                margin: "13px 0 12px",
              }}
            >
              {focal.format}
            </div>
            <div
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                color: accent,
                textTransform: "uppercase",
              }}
            >
              {DAY_NAMES[focal.day] ?? focal.day} · 08:00
            </div>
          </div>

          {/* card 2 — the pipeline, animated self-explanation */}
          <div
            className="tg-hero-card"
            style={{
              border: "1px solid var(--tg-frame)",
              background: "rgba(10,10,10,0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              padding: "26px 28px 28px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "var(--tg-sand)",
                textTransform: "uppercase",
              }}
            >
              The Pipeline
            </div>

            <div
              className="tg-pipe"
              style={{
                marginTop: 20,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <span className="tg-pipe-trail" aria-hidden="true" />
              <span className="tg-pipe-runner" aria-hidden="true" />
              {PIPELINE.map((stage, i) => (
                <div
                  key={stage.title}
                  className="tg-pipe-stage"
                  data-stage={i}
                  style={{ position: "relative", paddingLeft: 26 }}
                >
                  <span className="tg-pipe-node" aria-hidden="true" />
                  <div
                    style={{
                      fontFamily: "var(--tg-font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.16em",
                      color: "inherit",
                      textTransform: "uppercase",
                    }}
                  >
                    {stage.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--tg-font-mono)",
                      fontSize: 10,
                      lineHeight: 1.55,
                      letterSpacing: "0.04em",
                      color: "var(--tg-mute)",
                      marginTop: 5,
                    }}
                  >
                    {stage.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
