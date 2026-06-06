"use client";

import { useMemo, useState } from "react";

import { PostCard } from "@/components/public/post-card";
import { Tag } from "@/components/tag";
import { cn } from "@/lib/utils";
import type { PublicPostListItem } from "@/lib/public-api";

const ALL = "ALL";

interface PostsIndexProps {
  posts: ReadonlyArray<PublicPostListItem>;
}

export function PostsIndex({ posts }: PostsIndexProps) {
  const [activeSection, setActiveSection] = useState<string>(ALL);

  // Browse by Section (the v2 primary nav axis). Pills are derived from the
  // sections actually present in the loaded posts — so there are never empty/
  // dead buckets, and a section appears the moment it has a post (per the
  // "don't ship empty filters" guidance in notes/v2-ideas.md).
  const sections = useMemo(() => {
    const present = new Set<string>();
    for (const p of posts) {
      if (p.section) present.add(p.section);
    }
    return [...present].sort();
  }, [posts]);

  const filtered = useMemo(() => {
    if (activeSection === ALL) return posts;
    return posts.filter((p) => p.section === activeSection);
  }, [posts, activeSection]);

  return (
    <section
      data-testid="posts-index"
      className="px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-16"
    >
      <div className="flex items-center gap-4">
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

      <div
        className="mt-8 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter posts by section"
      >
        <FilterButton
          label={ALL}
          active={activeSection === ALL}
          onClick={() => setActiveSection(ALL)}
        />
        {sections.map((section) => (
          <FilterButton
            key={section}
            label={section}
            active={activeSection === section}
            onClick={() => setActiveSection(section)}
          />
        ))}
      </div>

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
