import Link from "next/link";

import type { PublicPostListItem } from "@/lib/public-api";
import { formatAccent } from "@/lib/public-format";

/**
 * Featured story band (the ★ marker) — the cover dispatch shown large: section
 * + format + FEATURED chip, an Archivo headline, the summary, and a CTA, with a
 * 16:9 image placeholder on the right (the design uses house imagery here; the
 * slot is left for the operator to fill — see REVIEW.md → Needs content).
 */
export function FeaturedStory({ post }: { post: PublicPostListItem }) {
  const accent = formatAccent(post.format);
  return (
    <div
      className="tg-band"
      style={{
        borderBottom: "1px solid var(--tg-frame-hair)",
        background: "var(--tg-band)",
      }}
    >
      <div
        className="tg-featured-grid tg-band-content"
        style={{
          padding: "44px 32px 48px 0",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 56,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            {post.section && (
              <span
                style={{
                  fontFamily: "var(--tg-font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  color: "var(--tg-orange)",
                  textTransform: "uppercase",
                }}
              >
                ◆ {post.section}
              </span>
            )}
            {post.format && (
              <span
                style={{
                  fontFamily: "var(--tg-font-mono)",
                  fontSize: 9,
                  color: accent,
                  border:
                    "1px solid color-mix(in srgb, currentColor 33%, transparent)",
                  padding: "2px 7px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {post.format}
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 9,
                background: "var(--tg-orange)",
                color: "var(--tg-ink-black)",
                padding: "2px 8px",
                fontWeight: 500,
                letterSpacing: "0.08em",
              }}
            >
              FEATURED
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--tg-font-display)",
              fontWeight: 700,
              fontStretch: "110%",
              fontSize: "clamp(26px, 3.2vw, 46px)",
              lineHeight: 1.04,
              letterSpacing: "-0.015em",
              color: "var(--tg-ink)",
              margin: "0 0 22px",
            }}
          >
            {post.title}
          </h2>
          <p
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--tg-mute)",
              margin: "0 0 28px",
            }}
          >
            {post.summary}
          </p>
          <Link href={`/blog/${post.slug}`} className="tg-btn">
            Read story →
          </Link>
        </div>
        <div
          className="tg-img-slot"
          style={{ aspectRatio: "16 / 9", border: "1px solid var(--tg-frame)" }}
        />
      </div>
    </div>
  );
}
