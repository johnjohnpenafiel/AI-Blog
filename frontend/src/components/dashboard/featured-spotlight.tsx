"use client";

import { Button, buttonClasses } from "@/components/button";
import type { PostListItem } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface FeaturedSpotlightProps {
  /** The currently-pinned post, or `null` when nothing is featured. */
  post: PostListItem | null;
  /**
   * When provided, renders an Unfeature button on the pinned panel. Omit for
   * read-only contexts (e.g. the overview glance) where management happens
   * elsewhere.
   */
  onUnfeature?: (post: PostListItem) => void;
  /** A feature/unfeature request for the pinned post is in flight. */
  busy?: boolean;
}

/**
 * Prominent readout of the post pinned to the homepage featured (★) band.
 * Accent-treated so the operator can clock the current pick at a glance.
 * Falls back to an empty panel when nothing is pinned (the band then shows the
 * most-recent dispatch).
 */
export function FeaturedSpotlight({
  post,
  onUnfeature,
  busy = false,
}: FeaturedSpotlightProps) {
  if (!post) {
    return (
      <div className="w-full border border-border bg-surface">
        <div
          className="flex items-center gap-3 px-4 py-3"
          data-testid="featured-spotlight-empty"
        >
          <span aria-hidden className="text-[14px] text-[var(--text-dim)]">
            ★
          </span>
          <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--text-dim)] uppercase">
            {"// No post pinned — homepage shows the most recent dispatch"}
          </p>
        </div>
      </div>
    );
  }

  // Featured pin — a plain rectangle (no chamfer), standard component border.
  return (
    <div className="w-full border border-border bg-surface">
      <div data-testid="featured-spotlight">
        <div className="px-4 pt-3 pb-3">
          <span className="font-mono text-[9px] tracking-[0.25em] text-accent uppercase">
            ★ Featured on homepage
          </span>

          <h3 className="mt-2 truncate font-editorial text-[16px] leading-tight font-bold tracking-[0.02em] text-fg">
            {post.title}
          </h3>
        </div>

        {/* Footer band — lighter surface + hairline divider, mirroring the
            published card's date / action strip. */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-dim bg-surface-raised px-4 py-2.5">
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
            {post.published_at && <span>{formatDate(post.published_at)}</span>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onUnfeature && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUnfeature(post)}
                disabled={busy}
                data-testid="featured-spotlight-unfeature"
              >
                Unfeature
              </Button>
            )}
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("outline", "sm")}
              data-testid="featured-spotlight-view"
            >
              View →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
