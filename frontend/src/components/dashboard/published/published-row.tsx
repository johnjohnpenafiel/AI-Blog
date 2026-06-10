"use client";

import { Button, buttonClasses } from "@/components/button";
import { ChamferedPanel } from "@/components/chamfered-panel";
import { EvalBadge } from "@/components/eval-badge";
import type { PostListItem } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface PublishedRowProps {
  post: PostListItem;
  /** Pin this post to the homepage featured band. */
  onFeature: (post: PostListItem) => void;
  /** Clear the pin (only meaningful when this post is featured). */
  onUnfeature: (post: PostListItem) => void;
  /** A feature/unfeature request for this row is in flight. */
  busy: boolean;
}

export function PublishedRow({
  post,
  onFeature,
  onUnfeature,
  busy,
}: PublishedRowProps) {
  // Minimal index — topic + kind of post. Story-type and tags are intentionally
  // omitted from the glance; the full record is one click into the post.
  const taxonomy = [post.section, post.format].filter(Boolean);

  return (
    <ChamferedPanel tier="component" size="card" className="w-full">
      <div data-testid="published-row">
        <div className="px-5 pt-4 pb-3">
          {/* Index — topic + kind of post. (Status omitted: this is the Published
              tab, so "published" is implied.) */}
          {taxonomy.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
              {taxonomy.map((part, i) => (
                <span key={part} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden>·</span>}
                  <span>{part}</span>
                </span>
              ))}
            </div>
          )}

          <h3 className="mt-3 font-editorial text-[19px] leading-tight font-bold tracking-[0.01em] text-fg">
            {post.title}
          </h3>

          <p className="mt-2 line-clamp-2 font-editorial text-sm leading-relaxed text-muted">
            {post.summary}
          </p>
        </div>

        {/* Footer band — lighter surface (--surface-raised) + hairline divider
            to set the date · eval / action strip apart from the content. */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-dim bg-surface-raised px-5 py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
            {post.published_at && <span>{formatDate(post.published_at)}</span>}
            <EvalBadge post={post} />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {post.is_featured ? (
              <Button
                variant="outline"
                onClick={() => onUnfeature(post)}
                disabled={busy}
                aria-pressed="true"
                className="bg-[var(--accent-glow)] hover:bg-transparent"
                data-testid="published-feature-toggle"
              >
                ★ Featured
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => onFeature(post)}
                disabled={busy}
                aria-pressed="false"
                data-testid="published-feature-toggle"
              >
                ★ Feature
              </Button>
            )}
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("outline", "md")}
              data-testid="published-view-link"
            >
              View →
            </a>
          </div>
        </div>
      </div>
    </ChamferedPanel>
  );
}
