"use client";

import Link from "next/link";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { Tag } from "@/components/tag";
import type { PublicPostListItem } from "@/lib/public-api";

interface PostCardProps {
  post: PublicPostListItem;
}

function formatPublishDate(iso: string): string {
  try {
    return new Date(iso)
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

export function PostCard({ post }: PostCardProps) {
  return (
    <ChamferedPanel
      tier="component"
      size="card"
      cut="single"
      className="w-full"
    >
      <div className="relative">
        {/* Left accent bar — runs the full card height below the chamfer */}
        <span
          aria-hidden
          className="absolute top-4 bottom-0 left-0 w-[2px] bg-accent"
        />
        <Link
          href={`/blog/${post.slug}`}
          data-testid="post-card"
          className="group block px-7 py-6 transition-colors hover:bg-[var(--surface-raised)]"
        >
          <h3 className="font-display text-[18px] leading-tight font-bold tracking-[0.02em] text-fg sm:text-[22px]">
            {post.title}
          </h3>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </div>
              <span>{formatPublishDate(post.published_at)}</span>
              <span>{post.read_time_minutes} MIN READ</span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.25em] text-accent uppercase transition-colors group-hover:text-[var(--accent-dim)]">
              Read →
            </span>
          </div>
        </Link>
      </div>
    </ChamferedPanel>
  );
}
