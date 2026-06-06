"use client";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { EvalBadge } from "@/components/eval-badge";
import { Tag } from "@/components/tag";
import { TaxonomyMeta } from "@/components/taxonomy-meta";
import type { PostListItem } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface PublishedRowProps {
  post: PostListItem;
}

export function PublishedRow({ post }: PublishedRowProps) {
  return (
    <ChamferedPanel tier="component" size="card" className="w-full">
      <div className="px-5 py-5" data-testid="published-row">
        <div className="flex items-center justify-end gap-3">
          <EvalBadge post={post} />
          <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
            <span
              aria-hidden="true"
              className="inline-block size-[7px] bg-[var(--success)]"
            />
            Published
            {post.published_at && <span>· {formatDate(post.published_at)}</span>}
          </span>
        </div>

        <h3 className="mt-3 font-display text-[20px] font-bold tracking-[0.02em] text-fg">
          {post.title}
        </h3>

        <TaxonomyMeta post={post} className="mt-2" />

        <p className="mt-2 text-sm leading-relaxed text-muted">
          {post.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-accent px-4 py-2 font-mono text-[11px] tracking-[0.25em] text-accent uppercase transition-colors hover:bg-[var(--accent-glow)]"
            data-testid="published-view-link"
          >
            View post →
          </a>
        </div>
      </div>
    </ChamferedPanel>
  );
}
