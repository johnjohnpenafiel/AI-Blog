import Link from "next/link";

import type { PublicFeaturedPost } from "@/lib/public-api";
import { formatAccent } from "@/lib/public-format";

/**
 * Featured story band — the cover dispatch, framed as a distinct artifact
 * rather than a bigger post-card. Where the dispatch rows and post cards are
 * flat rules/boxes in the flow, this one sits inside its own bordered frame
 * (a darker inset than the surrounding band, closed with an orange top rule)
 * with a huge translucent watermark star behind the copy — visual weight no
 * other element on the page carries. The eyebrow reflects the REAL backend
 * distinction (`is_featured`): a genuine editor's pin reads "Editor's Pick";
 * the plain recency fallback reads "Currently Featured" — not decoration, an
 * honest signal about why this post is here.
 */
export function FeaturedStory({ post }: { post: PublicFeaturedPost }) {
  const accent = formatAccent(post.format);
  return (
    <div
      className="tg-band"
      style={{
        borderBottom: "1px solid var(--tg-frame-hair)",
        background: "var(--tg-band)",
      }}
    >
      <div className="tg-band-content" style={{ padding: "40px 32px 44px 0" }}>
        <div
          className="tg-featured-frame"
          style={{
            position: "relative",
            overflow: "hidden",
            background: "var(--tg-bg)",
            borderLeft: "1px solid var(--tg-frame)",
            borderRight: "1px solid var(--tg-frame)",
            borderBottom: "1px solid var(--tg-frame)",
            borderTop: "2px solid var(--tg-orange)",
          }}
        >
          {/* huge ghost watermark — decorative weight no card/row has */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -46,
              right: -8,
              fontSize: "clamp(160px, 18vw, 260px)",
              lineHeight: 1,
              color: "rgba(232,80,2,0.05)",
              fontFamily: "var(--tg-font-display)",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 0,
            }}
          >
            ★
          </span>

          {/* eyebrow — the real signal, not a generic "FEATURED" chip */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 22,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                color: "var(--tg-orange)",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              ★ {post.is_featured ? "Editor's Pick" : "Currently Featured"}
            </span>
            <span style={{ flex: 1, height: 1, background: "var(--tg-frame-hair)" }} />
            {post.section && (
              <span
                style={{
                  fontFamily: "var(--tg-font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: "var(--tg-sand)",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
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
                  whiteSpace: "nowrap",
                }}
              >
                {post.format}
              </span>
            )}
          </div>

          <div
            className="tg-featured-grid"
            style={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 56,
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--tg-font-display)",
                  fontWeight: 700,
                  fontStretch: "116%",
                  fontSize: "clamp(32px, 4.6vw, 60px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.018em",
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
                  maxWidth: 520,
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
            >
              {post.image_url && (
                // eslint-disable-next-line @next/next/no-img-element -- plain <img>: this is a patched Next.js; see AGENTS.md
                <img
                  src={post.image_url}
                  alt={post.title}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
              <span
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  fontFamily: "var(--tg-font-mono)",
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  color: "var(--tg-ink)",
                  background: "rgba(10,10,10,0.7)",
                  padding: "4px 8px",
                  textTransform: "uppercase",
                }}
              >
                ★ Cover
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
