import Link from "next/link";

import type { PublicPostDetail } from "@/lib/public-api";
import { formatAccent, longDate, readLabel } from "@/lib/public-format";

import { ShareChips } from "./share-chips";

/**
 * Dispatch header — breadcrumb, article title block (section + format + lede),
 * the metadata strip (Published / By / Read time / Filed under + Share), and
 * the lead image placeholder. Static byline "The Garage Desk" is the
 * publication's voice (we don't store per-post authors).
 */
function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--tg-font-mono)",
          fontSize: 9,
          letterSpacing: "0.16em",
          color: "var(--tg-faint)",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: "var(--tg-font-mono)", fontSize: 12, letterSpacing: "0.04em" }}>
        {children}
      </div>
    </div>
  );
}

export function DispatchHeader({ post }: { post: PublicPostDetail }) {
  const accent = formatAccent(post.format);
  return (
    <>
      {/* breadcrumb */}
      <div
        className="tg-band"
        style={{
          borderBottom: "1px solid var(--tg-frame-hair)",
          background: "var(--tg-band)",
        }}
      >
        <div
          className="tg-band-content"
          style={{
            padding: "16px var(--tg-content-pad) 16px 0",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <Link href="/" className="tg-nav-link">
            The Index
          </Link>
          {post.section && (
            <>
              <span style={{ color: "var(--tg-frame)", fontFamily: "var(--tg-font-mono)", fontSize: 10 }}>
                /
              </span>
              <span
                style={{
                  fontFamily: "var(--tg-font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: "var(--tg-orange)",
                  textTransform: "uppercase",
                }}
              >
                {post.section}
              </span>
            </>
          )}
          {post.format && (
            <>
              <span style={{ color: "var(--tg-frame)", fontFamily: "var(--tg-font-mono)", fontSize: 10 }}>
                /
              </span>
              <span
                style={{
                  fontFamily: "var(--tg-font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: "var(--tg-faint)",
                  textTransform: "uppercase",
                }}
              >
                {post.format}
              </span>
            </>
          )}
        </div>
      </div>

      {/* title block */}
      <div
        className="tg-band"
        style={{
          borderBottom: "1px solid var(--tg-frame-hair)",
        }}
      >
        <div
          className="tg-band-content"
          style={{ padding: "44px var(--tg-content-pad) 48px 0" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
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
                  border: "1px solid color-mix(in srgb, currentColor 33%, transparent)",
                  padding: "2px 7px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {post.format}
              </span>
            )}
          </div>
          <h1
            className="tg-post-title"
            style={{
              fontFamily: "var(--tg-font-display)",
              fontWeight: 700,
              fontStretch: "116%",
              fontSize: "clamp(36px, 5.4vw, 72px)",
              lineHeight: 0.98,
              letterSpacing: "-0.02em",
              color: "var(--tg-ink)",
              margin: "0 0 26px",
              maxWidth: 1000,
              textWrap: "balance",
            }}
          >
            {post.title}
          </h1>
          <p
            style={{
              fontFamily: "var(--tg-font-display)",
              fontWeight: 400,
              fontStretch: "112%",
              fontSize: 21,
              lineHeight: 1.5,
              letterSpacing: "0.002em",
              color: "var(--tg-mute)",
              maxWidth: 720,
              margin: 0,
            }}
          >
            {post.summary}
          </p>
        </div>
      </div>

      {/* metadata strip */}
      <div
        className="tg-band"
        style={{
          borderBottom: "1px solid var(--tg-frame-hair)",
          background: "var(--tg-band)",
        }}
      >
        <div
          className="tg-band-content tg-meta-strip"
          style={{
            padding: "26px var(--tg-content-pad) 28px 0",
            display: "flex",
            gap: 48,
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div
            className="tg-meta-items"
            style={{ display: "flex", gap: 44, flexWrap: "wrap" }}
          >
            <MetaItem label="Published">
              <span style={{ color: "var(--tg-ink)" }}>{longDate(post.published_at)}</span>
            </MetaItem>
            <MetaItem label="By">
              <span className="tg-body-link">The Garage Desk</span>
            </MetaItem>
            <MetaItem label="Read time">
              <span style={{ color: "var(--tg-ink)" }}>{readLabel(post.read_time_minutes)}</span>
            </MetaItem>
            {post.tags.length > 0 && (
              <MetaItem label="Filed under">
                <span style={{ color: "var(--tg-sand)" }}>{post.tags.join(" · ")}</span>
              </MetaItem>
            )}
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 9,
                letterSpacing: "0.16em",
                color: "var(--tg-faint)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Share
            </div>
            <ShareChips title={post.title} />
          </div>
        </div>
      </div>

      {/* lead image placeholder — hidden on mobile until real images ship */}
      <div
        className="tg-band tg-fig0-band"
        style={{ borderBottom: "1px solid var(--tg-frame-hair)" }}
      >
        <div
          style={{
            paddingLeft: "var(--tg-edge)",
            paddingRight: "var(--tg-content-pad)",
            paddingTop: 40,
            paddingBottom: 44,
          }}
        >
          <div
            className="tg-img-slot"
            style={{ aspectRatio: "16 / 9", border: "1px solid var(--tg-frame)" }}
          />
          <div
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 10,
              letterSpacing: "0.08em",
              color: "var(--tg-faint)",
              textTransform: "uppercase",
              marginTop: 12,
            }}
          >
            FIG.0 — Lead image placeholder
          </div>
        </div>
      </div>
    </>
  );
}
