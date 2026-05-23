"use client";

import { useMemo, useState } from "react";

import { PostCard } from "@/components/public/post-card";
import { Tag } from "@/components/tag";
import { cn } from "@/lib/utils";
import type { PublicPostListItem } from "@/lib/public-api";

// Canonical tag set per PLANNING.md — Claude is prompted to choose 2–4 from
// this list. Displayed as filter pills above the index grid.
const FILTER_TAGS = [
  "Voice AI",
  "Pricing & Analytics",
  "CRM",
  "Merchandising",
  "Sales Dev",
  "OT & Infrastructure",
  "Industry Move",
] as const;

const ALL = "ALL";

interface PostsIndexProps {
  posts: ReadonlyArray<PublicPostListItem>;
}

export function PostsIndex({ posts }: PostsIndexProps) {
  const [activeTag, setActiveTag] = useState<string>(ALL);

  const filtered = useMemo(() => {
    if (activeTag === ALL) return posts;
    return posts.filter((p) => p.tags.includes(activeTag));
  }, [posts, activeTag]);

  return (
    <section
      data-testid="posts-index"
      className="mx-auto max-w-6xl px-6 py-10"
    >
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter posts by tag"
      >
        <FilterButton
          label={ALL}
          active={activeTag === ALL}
          onClick={() => setActiveTag(ALL)}
        />
        {FILTER_TAGS.map((tag) => (
          <FilterButton
            key={tag}
            label={tag}
            active={activeTag === tag}
            onClick={() => setActiveTag(tag)}
          />
        ))}
      </div>

      <div className="mt-12 flex items-center gap-4">
        <span className="font-mono text-[10px] tracking-[0.25em] text-accent uppercase">
          {"// THE INDEX"}
        </span>
        <span className="h-px flex-1 bg-[var(--border-dim)]" />
        <span className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
          {filtered.length} {filtered.length === 1 ? "TRANSMISSION" : "TRANSMISSIONS"}
        </span>
      </div>

      <h2 className="mt-4 font-display text-[28px] font-bold tracking-[0.02em] text-fg sm:text-[34px]">
        Latest dispatches
      </h2>

      <div className="mt-10 flex flex-col gap-6">
        {filtered.length === 0 ? (
          <p
            data-testid="index-empty"
            className="border-t border-border-dim pt-10 text-center font-mono text-[11px] tracking-[0.25em] text-dim uppercase"
          >
            {"// NO TRANSMISSIONS FOUND"}
          </p>
        ) : (
          filtered.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </section>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`filter-${label}`}
      aria-pressed={active}
      className={cn(
        "transition-opacity",
        !active && "opacity-90 hover:opacity-100",
      )}
    >
      <Tag label={label} active={active} />
    </button>
  );
}
