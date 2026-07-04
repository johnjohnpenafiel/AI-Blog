import Link from "next/link";

import type { PublicPostListItem } from "@/lib/public-api";
import { readLabel, shortDate } from "@/lib/public-format";

/**
 * Post card — the halftone-header card used in the reading-modes grid and the
 * related-dispatches grid. Mono uppercase title + excerpt (the card voice),
 * with the post's tags as the `>` point list.
 *
 * The image header is a clearly-marked placeholder slot (`.tg-img-slot`) — the
 * design intends procedural halftone art or an image here; the only real asset
 * wired in the redesign is the hero video. See REVIEW.md → Needs content.
 */
export function PostCard({
  post,
  accent = "var(--tg-orange)",
  figNumber,
  showSection = false,
}: {
  post: PublicPostListItem;
  accent?: string;
  figNumber?: number;
  showSection?: boolean;
}) {
  const points = post.tags.slice(0, 3);
  return (
    <Link href={`/blog/${post.slug}`} className="tg-card">
      {/* image placeholder header (framed/inset) */}
      <div
        className="tg-img-slot"
        style={{ aspectRatio: "5 / 4", margin: "13px 13px 0" }}
      >
        {figNumber != null && (
          <span
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              fontFamily: "var(--tg-font-mono)",
              fontSize: 8,
              letterSpacing: "0.14em",
              color: "var(--tg-ink)",
              background: "rgba(10,10,10,0.7)",
              padding: "3px 7px",
              textTransform: "uppercase",
            }}
          >
            FIG. {figNumber}
          </span>
        )}
      </div>

      <div
        style={{
          padding: "14px 14px 16px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 9,
              letterSpacing: "0.12em",
              color: accent,
              textTransform: "uppercase",
            }}
          >
            {shortDate(post.published_at)}
          </span>
          <span
            style={{ width: 3, height: 3, background: "var(--tg-frame)" }}
          />
          <span
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 9,
              letterSpacing: "0.12em",
              color: "var(--tg-faint)",
            }}
          >
            {readLabel(post.read_time_minutes)}
          </span>
        </div>

        {showSection && post.section && (
          <div
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 8,
              letterSpacing: "0.12em",
              color: accent,
              textTransform: "uppercase",
              marginBottom: 9,
            }}
          >
            ◆ {post.section}
          </div>
        )}

        <h4
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontWeight: 500,
            fontSize: "13.5px",
            lineHeight: 1.28,
            letterSpacing: "0.005em",
            color: "var(--tg-ink)",
            margin: "0 0 9px",
            textTransform: "uppercase",
          }}
        >
          {post.title}
        </h4>

        <p
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontSize: 10,
            lineHeight: 1.6,
            letterSpacing: "0.02em",
            color: "var(--tg-mute)",
            margin: "0 0 18px",
            textTransform: "uppercase",
          }}
        >
          {post.summary}
        </p>

        {points.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: "auto",
            }}
          >
            {points.map((pt) => (
              <div
                key={pt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--tg-font-mono)",
                    fontSize: 11,
                    color: accent,
                    lineHeight: 1,
                  }}
                >
                  &gt;
                </span>
                <span
                  style={{
                    fontFamily: "var(--tg-font-mono)",
                    fontSize: 9,
                    fontWeight: 400,
                    letterSpacing: "0.05em",
                    background: "rgba(255,255,255,0.035)",
                    color: "var(--tg-ink-soft)",
                    border: "1px solid var(--tg-frame-hair)",
                    padding: "4px 8px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  {pt}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
