"use client";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { EvalBadge } from "@/components/eval-badge";
import type { PostListItem } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface QueueCardProps {
  post: PostListItem;
  onOpen: (id: string) => void;
}

export function QueueCard({ post, onOpen }: QueueCardProps) {
  // Minimal triage index — every pending post gets opened to review, so the
  // card only needs to identify it and flag anything review-worthy (eval,
  // regeneration). Summary / tags / story_type live behind Review →.
  const taxonomy = [post.section, post.format].filter(Boolean);
  const hasTopRow = taxonomy.length > 0 || post.generation_attempt > 1;

  return (
    <ChamferedPanel tier="component" size="card" className="w-full">
      <button
        type="button"
        onClick={() => onOpen(post.id)}
        className="group block w-full text-left"
        data-testid="queue-card"
      >
        <div className="px-5 pt-4 pb-3 transition-colors group-hover:bg-surface-raised">
          {hasTopRow && (
            <div className="flex items-center justify-between gap-3">
              {taxonomy.length > 0 ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
                  {taxonomy.map((part, i) => (
                    <span key={part} className="flex items-center gap-2">
                      {i > 0 && <span aria-hidden>·</span>}
                      <span>{part}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <span />
              )}
              {post.generation_attempt > 1 && (
                <span className="shrink-0 font-mono text-[10px] tracking-[0.25em] text-accent uppercase">
                  Attempt {post.generation_attempt}
                </span>
              )}
            </div>
          )}

          <h3 className="mt-3 font-editorial text-[19px] leading-tight font-bold tracking-[0.01em] text-fg">
            {post.title}
          </h3>
        </div>

        {/* Footer band — generated date · eval (left), Review affordance (right). */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-dim bg-surface-raised px-5 py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
            <span>Generated {formatDate(post.created_at)}</span>
            <EvalBadge post={post} />
          </div>
          <span className="shrink-0 font-mono text-[10px] tracking-[0.25em] text-accent uppercase group-hover:text-[var(--accent-dim)]">
            Review →
          </span>
        </div>
      </button>
    </ChamferedPanel>
  );
}
