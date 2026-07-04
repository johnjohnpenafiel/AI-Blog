import type { PublicPostListItem } from "@/lib/public-api";
import { formatAccent } from "@/lib/public-format";

import { PostCard } from "./post-card";

/**
 * Related dispatches band — up to three other dispatches as "Fig." cards
 * (section line + halftone placeholder header). Bound to live posts the page
 * picks (same section first, then most recent).
 */
export function RelatedDispatches({ posts }: { posts: PublicPostListItem[] }) {
  if (posts.length === 0) return null;
  return (
    <div
      className="tg-band"
      style={{
        display: "grid",
        gridTemplateColumns: "var(--tg-gutter) 1fr",
        background: "var(--tg-bg)",
      }}
    >
      <div className="tg-band-marker" style={{ paddingLeft: 24, paddingTop: 32 }}>
        <span
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "var(--tg-faint)",
          }}
        >
          (rel)
        </span>
      </div>
      <div
        className="tg-band-content"
        style={{ padding: "34px var(--tg-content-pad) 8px 0" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 22,
            flexWrap: "wrap",
          }}
        >
          <span
            className="tg-pulse"
            style={{ width: 6, height: 6, background: "var(--tg-orange)" }}
          />
          <span
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 11,
              letterSpacing: "0.16em",
              color: "var(--tg-ink)",
              textTransform: "uppercase",
            }}
          >
            Related dispatches
          </span>
          <span
            style={{
              flex: 1,
              height: 1,
              background: "var(--tg-frame-hair)",
              minWidth: 20,
            }}
          />
          <span
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 9,
              letterSpacing: "0.14em",
              color: "var(--tg-faint)",
              textTransform: "uppercase",
            }}
          >
            {String(posts.length).padStart(2, "0")} Reads
          </span>
        </div>
        <div className="tg-rel-grid">
          {posts.map((post, i) => (
            <PostCard
              key={post.slug}
              post={post}
              accent={formatAccent(post.format)}
              figNumber={i + 1}
              showSection
            />
          ))}
        </div>
      </div>
    </div>
  );
}
