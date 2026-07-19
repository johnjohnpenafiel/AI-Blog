import Link from "next/link";

import type { PublicPostListItem } from "@/lib/public-api";
import { dotDate } from "@/lib/public-format";

/**
 * "/ Related articles" band — a two-up card gallery: framed cover figure
 * (mono `[ FIG.n ]` header bar) beside a large light-Archivo title, clamped
 * summary, and mono section/format chips. Hovering a card floods its text in
 * hot-magenta highlight (the sanctioned literal) with ink-black content —
 * the text-highlight cousin of the index rows' full-row flood.
 * Bound to live posts the page picks (same section first, then most recent).
 */
export function RelatedDispatches({ posts }: { posts: PublicPostListItem[] }) {
  if (posts.length === 0) return null;
  return (
    <div className="tg-band-sec">
      <div className="tg-seclabel">/ Related articles</div>
      <div className="tg-relgrid">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="tg-relcard">
            <div className="tg-relcard-fig">
              <div
                className={
                  post.image_url
                    ? "tg-relcard-frame"
                    : "tg-relcard-frame tg-img-slot"
                }
              >
                {post.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element -- plain <img>: this is a patched Next.js; see AGENTS.md
                  <img src={post.image_url} alt="" />
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
                {post.section && (
                  <span className="tg-relcard-chip">{post.section}</span>
                )}
                {post.format && (
                  <span className="tg-relcard-chip">{post.format}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
