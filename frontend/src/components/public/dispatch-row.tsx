import Link from "next/link";

import type { PublicPostListItem } from "@/lib/public-api";
import { formatAccent, longDate, readLabel } from "@/lib/public-format";

/**
 * Editorial dispatch row — the index list item: meta line (date · ◆ section ·
 * format · read · LIVE), an extended-Archivo headline, the summary, and the
 * "Read dispatch →" affordance. Hover states are pure CSS (`.tg-dispatch*`).
 */
export function DispatchRow({
  post,
  hot = false,
  last = false,
}: {
  post: PublicPostListItem;
  hot?: boolean;
  last?: boolean;
}) {
  const accent = formatAccent(post.format);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="tg-dispatch"
      style={{
        padding: "28px 0 30px",
        borderBottom: last ? "none" : "1px solid var(--tg-frame-hair)",
      }}
    >
      <div className="tg-band-content" style={{ paddingRight: 32, maxWidth: 960 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "var(--tg-mute)",
            }}
          >
            {longDate(post.published_at)}
          </span>
          {post.section && (
            <span
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
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
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "1px solid color-mix(in srgb, currentColor 33%, transparent)",
                padding: "2px 7px",
              }}
            >
              {post.format}
            </span>
          )}
          <span
            className="tg-dispatch-read"
            style={{ fontFamily: "var(--tg-font-mono)", fontSize: 10 }}
          >
            {readLabel(post.read_time_minutes)}
          </span>
          {hot && (
            <span
              style={{
                fontFamily: "var(--tg-font-mono)",
                fontSize: 9,
                background: "var(--tg-orange)",
                color: "var(--tg-ink-black)",
                padding: "2px 8px",
                letterSpacing: "0.1em",
                fontWeight: 500,
              }}
            >
              LIVE
            </span>
          )}
        </div>

        <h3
          className="tg-dispatch-headline"
          style={{
            fontFamily: "var(--tg-font-display)",
            fontWeight: 700,
            fontStretch: "112%",
            fontSize: "clamp(22px, 3vw, 38px)",
            lineHeight: 1.06,
            letterSpacing: "-0.012em",
            margin: "0 0 12px",
          }}
        >
          {post.title}
        </h3>

        <p
          style={{
            fontFamily: "var(--tg-font-display)",
            fontWeight: 400,
            fontStretch: "110%",
            fontSize: 15,
            lineHeight: 1.5,
            letterSpacing: "0.002em",
            color: "var(--tg-mute)",
            margin: "0 0 14px",
            maxWidth: 640,
          }}
        >
          {post.summary}
        </p>

        <span
          className="tg-dispatch-read"
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Read dispatch →
        </span>
      </div>
    </Link>
  );
}
