import Link from "next/link";

import type { PublicPostListItem } from "@/lib/public-api";
import { formatAccent, readLabel, shortDate } from "@/lib/public-format";

/**
 * Intro band — the index hero. The real hero.mp4 plays as the background
 * (darkened under a left-to-right protection gradient so type stays legible);
 * left column carries the identity + CTAs + stats, right column the "latest
 * dispatch" card bound to the cover post.
 *
 * Copy note: cadence is THREE dispatches a week (Mon Brief / Thu Deep Dive /
 * Fri Roundup) — the handoff's "twice-weekly" sample copy was corrected to
 * match the real pipeline. See REVIEW.md → Decisions to review.
 */
export function HeroIntro({
  coverPost,
  totalCount,
  sectionsCount,
  formatsCount,
}: {
  coverPost: PublicPostListItem;
  totalCount: number;
  sectionsCount: number;
  formatsCount: number;
}) {
  const accent = formatAccent(coverPost.format);
  const stats: [string, string][] = [
    ["3×", "WEEKLY"],
    [String(sectionsCount), "SECTIONS"],
    [String(formatsCount), "FORMATS"],
  ];

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "var(--tg-gutter) 1fr",
        borderBottom: "1px solid var(--tg-frame-hair)",
        overflow: "hidden",
      }}
    >
      {/* real hero video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, rgba(10,10,10,0.62) 0%, rgba(10,10,10,0.24) 48%, rgba(10,10,10,0.0) 100%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, paddingLeft: 24, paddingTop: 40 }}>
        <span
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontSize: 12,
            letterSpacing: "0.1em",
            color: "var(--tg-mute)",
          }}
        >
          ({String(totalCount).padStart(2, "0")})
        </span>
      </div>

      <div
        className="tg-hero-grid"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "40px 32px 44px 0",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) 360px",
          gap: 48,
          alignItems: "start",
        }}
      >
        {/* left identity */}
        <div>
          <div className="tg-fade-up" style={{ marginBottom: 16, animationDelay: "0.04s" }}>
            <span
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                color: "var(--tg-sand)",
                textTransform: "uppercase",
              }}
            >
              {"// The Index · Dealership AI"}
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
            Latest
            <br />
            Dispatches
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
              maxWidth: 460,
              margin: "0 0 30px",
              animationDelay: "0.1s",
            }}
          >
            Three dispatches a week on the artificial intelligence reshaping how
            automotive dealerships sell, service, and operate.
          </p>
          <div
            className="tg-fade-up"
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              marginBottom: 40,
              flexWrap: "wrap",
              animationDelay: "0.16s",
            }}
          >
            <Link href={`/blog/${coverPost.slug}`} className="tg-btn">
              Read the latest →
            </Link>
            {/* Subscribe flow not built yet (Phase 4). */}
            <span
              className="tg-btn-ghost"
              aria-disabled="true"
              title="Subscribe — not yet wired (Phase 4 newsletter)"
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            >
              Subscribe
            </span>
            <span className="tg-needs">⟨NEEDS CONTENT: subscribe flow⟩</span>
          </div>
          {/* stats */}
          <div className="tg-fade-up" style={{ display: "flex", gap: 48, animationDelay: "0.22s" }}>
            {stats.map(([num, label]) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: "var(--tg-font-display)",
                    fontWeight: 800,
                    fontStretch: "118%",
                    fontSize: 44,
                    color: "var(--tg-orange)",
                    lineHeight: 1,
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontFamily: "var(--tg-font-mono)",
                    fontSize: 9,
                    letterSpacing: "0.15em",
                    color: "var(--tg-faint)",
                    marginTop: 5,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right — latest dispatch card */}
        <Link
          href={`/blog/${coverPost.slug}`}
          className="tg-fade-up"
          style={{
            border: "1px solid var(--tg-frame)",
            background: "rgba(10,10,10,0.6)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            padding: "20px 22px",
            textDecoration: "none",
            display: "block",
            animationDelay: "0.18s",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 9,
                letterSpacing: "0.18em",
                color: "var(--tg-faint)",
                textTransform: "uppercase",
              }}
            >
              Latest dispatch
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                className="tg-pulse"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--tg-orange)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--tg-font-mono)",
                  fontSize: 8,
                  color: "var(--tg-orange)",
                  letterSpacing: "0.1em",
                }}
              >
                LIVE
              </span>
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            {coverPost.section && (
              <span
                style={{
                  fontFamily: "var(--tg-font-mono)",
                  fontSize: 8,
                  color: "var(--tg-orange)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                ◆ {coverPost.section}
              </span>
            )}
            {coverPost.format && (
              <span
                style={{
                  fontFamily: "var(--tg-font-mono)",
                  fontSize: 8,
                  color: accent,
                  letterSpacing: "0.08em",
                  border:
                    "1px solid color-mix(in srgb, currentColor 33%, transparent)",
                  padding: "1px 5px",
                }}
              >
                {coverPost.format}
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 8,
                color: "var(--tg-faint)",
              }}
            >
              {shortDate(coverPost.published_at)} ·{" "}
              {readLabel(coverPost.read_time_minutes)}
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--tg-font-display)",
              fontWeight: 500,
              fontStretch: "110%",
              fontSize: 16,
              lineHeight: 1.34,
              letterSpacing: "-0.005em",
              color: "#d8d4ce",
              margin: "0 0 12px",
            }}
          >
            {coverPost.title}
          </p>
          <p
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 11,
              lineHeight: 1.6,
              color: "var(--tg-mute)",
              margin: "0 0 16px",
            }}
          >
            {coverPost.summary}
          </p>
          <span className="tg-btn-ghost">Read now →</span>
        </Link>
      </div>
    </div>
  );
}
