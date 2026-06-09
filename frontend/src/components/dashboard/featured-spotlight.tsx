"use client";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { Tag } from "@/components/tag";
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
      <ChamferedPanel tier="component" size="card" className="w-full">
        <div
          className="flex items-center gap-3 px-5 py-5"
          data-testid="featured-spotlight-empty"
        >
          <span aria-hidden className="text-[16px] text-[var(--text-dim)]">
            ★
          </span>
          <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--text-dim)] uppercase">
            {"// No post pinned — homepage shows the most recent dispatch"}
          </p>
        </div>
      </ChamferedPanel>
    );
  }

  return (
    <ChamferedPanel
      tier="component"
      size="card"
      className="w-full"
      chamferWidth={3}
    >
      <div className="relative px-5 py-5" data-testid="featured-spotlight">
        <span
          aria-hidden
          className="absolute bottom-0 left-0 w-[3px]"
          style={{ top: "16px", backgroundColor: "var(--accent)" }}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 pl-3">
          <span className="font-mono text-[10px] tracking-[0.25em] text-accent uppercase">
            ★ Featured on homepage
          </span>
          {post.published_at && (
            <span className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
              {formatDate(post.published_at)}
            </span>
          )}
        </div>

        <h3 className="mt-3 pl-3 font-display text-[20px] font-bold tracking-[0.02em] text-fg">
          {post.title}
        </h3>

        <p className="mt-2 pl-3 text-sm leading-relaxed text-muted">
          {post.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pl-3">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onUnfeature && (
              <button
                type="button"
                onClick={() => onUnfeature(post)}
                disabled={busy}
                className="border border-border px-4 py-2 font-mono text-[11px] tracking-[0.25em] text-muted uppercase transition-colors hover:text-fg disabled:opacity-50"
                data-testid="featured-spotlight-unfeature"
              >
                Unfeature
              </button>
            )}
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-accent px-4 py-2 font-mono text-[11px] tracking-[0.25em] text-accent uppercase transition-colors hover:bg-[var(--accent-glow)]"
              data-testid="featured-spotlight-view"
            >
              View post →
            </a>
          </div>
        </div>
      </div>
    </ChamferedPanel>
  );
}
