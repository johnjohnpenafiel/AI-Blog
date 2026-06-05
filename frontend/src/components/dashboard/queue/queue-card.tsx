"use client";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { EvalBadge } from "@/components/eval-badge";
import { Tag } from "@/components/tag";
import type { PostListItem } from "@/lib/api";

interface QueueCardProps {
  post: PostListItem;
  onOpen: (id: string) => void;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d
      .toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      .toUpperCase();
  } catch {
    return iso;
  }
}

export function QueueCard({ post, onOpen }: QueueCardProps) {
  return (
    <ChamferedPanel tier="component" size="card" className="w-full">
      <button
        type="button"
        onClick={() => onOpen(post.id)}
        className="group block w-full px-5 py-5 text-left transition-colors hover:bg-[var(--surface-raised)]"
        data-testid="queue-card"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
            Generated {formatDate(post.created_at)}
          </span>
          <div className="flex items-center gap-2">
            {post.generation_attempt > 1 && (
              <span className="font-mono text-[10px] tracking-[0.25em] text-accent uppercase">
                Attempt {post.generation_attempt}
              </span>
            )}
            <EvalBadge post={post} />
          </div>
        </div>

        <h3 className="mt-3 font-display text-[20px] font-bold tracking-[0.02em] text-fg">
          {post.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          {post.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
          <span className="font-mono text-[10px] tracking-[0.25em] text-accent uppercase group-hover:text-[var(--accent-dim)]">
            Review →
          </span>
        </div>
      </button>
    </ChamferedPanel>
  );
}
