import Link from "next/link";

import type { PublicPostListItem } from "@/lib/public-api";
import { dotDate } from "@/lib/public-format";

/**
 * The console-window dispatch card (from the Post v2 canvas's related-articles
 * gallery): framed cover figure (empty window-chrome title bar + matte) beside
 * a large light-Archivo title, clamped summary, and gold section/format chips.
 * Hovering floods the card's text in hot-magenta highlight with ink-black
 * content — the text-highlight cousin of the index rows' full-row flood.
 *
 * Shared by the post page's "/ Related articles" band and the homepage's
 * "/ Featured post" · "/ Latest post" spotlight.
 */
export function DispatchCard({
  post,
  imageUrl,
}: {
  post: PublicPostListItem;
  imageUrl: string | null;
}) {
  return (
    <Link href={`/blog/${post.slug}`} className="tg-relcard">
      <div className="tg-relcard-fig">
        <div className="tg-relcard-bar" />
        <div
          className={imageUrl ? "tg-relcard-frame" : "tg-relcard-frame tg-img-slot"}
        >
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- plain <img>: this is a patched Next.js; see AGENTS.md
            <img src={imageUrl} alt="" />
          )}
        </div>
      </div>
      <div className="tg-relcard-body">
        <span className="tg-rel-date">
          <span className="tg-rel-bullet" />
          {dotDate(post.published_at)}
        </span>
        <h3 className="tg-relcard-title">
          <span className="tg-relcard-hl">
            {post.title}{" "}
            <svg
              width="20"
              height="20"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 13L13 5M13 5H6M13 5V12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </h3>
        <p className="tg-relcard-sum">
          <span className="tg-relcard-hl">{post.summary}</span>
        </p>
        <div className="tg-relcard-chips">
          {post.section && <span className="tg-relcard-chip">{post.section}</span>}
          {post.format && <span className="tg-relcard-chip">{post.format}</span>}
        </div>
      </div>
    </Link>
  );
}
