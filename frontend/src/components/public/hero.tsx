import Link from "next/link";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { Tag } from "@/components/tag";
import { GlowOrb } from "@/components/public/glow-orb";
import { getIssueLabel } from "@/lib/get-issue-label";
import type { PublicPostListItem } from "@/lib/public-api";

interface HeroProps {
  coverPost: PublicPostListItem;
  allPosts: ReadonlyArray<PublicPostListItem>;
}

function formatPublishDate(iso: string): string {
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

export function Hero({ coverPost, allPosts }: HeroProps) {
  const issueLabel = getIssueLabel(coverPost.published_at, allPosts);

  return (
    <section
      data-testid="public-hero"
      className="relative isolate overflow-hidden"
    >
      <GlowOrb
        size={780}
        className="-top-40 right-[-12rem] opacity-90 sm:right-[-6rem]"
      />

      <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-6 py-24">
        <div className="h-px w-full bg-[var(--border-dim)]" />

        <div className="mt-4 flex flex-col gap-3 text-[10px] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 font-mono tracking-[0.25em] uppercase">
            <span className="text-accent">{"// COVER STORY"}</span>
            <span className="hidden h-px w-12 bg-[var(--border-dim)] sm:block" />
            <span className="text-muted">{issueLabel.formatted}</span>
          </div>
          <div className="flex items-center gap-2 font-mono tracking-[0.25em] uppercase">
            <span
              aria-hidden
              className="inline-block size-[7px] bg-accent"
              style={{ boxShadow: "0 0 10px rgb(255 106 0 / 0.6)" }}
            />
            <span className="text-muted">LIVE FEED</span>
          </div>
        </div>

        <h1 className="mt-10 max-w-4xl font-display text-[44px] leading-[1.05] font-bold tracking-[0.01em] text-fg sm:text-[56px] md:text-[64px]">
          {coverPost.title}
        </h1>

        <div className="mt-8 h-px w-full bg-[var(--border-dim)]" />

        <p className="mt-4 max-w-3xl font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
          {coverPost.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {coverPost.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
          <span className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
            {coverPost.read_time_minutes} MIN READ
          </span>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <ChamferedPanel
            tier="component"
            size="button"
            cut="dual"
            background="transparent"
            perimeterStroke="var(--accent)"
            className="self-start"
          >
            <Link
              href={`/blog/${coverPost.slug}`}
              data-testid="hero-cta"
              className="block px-6 py-3 font-mono text-[11px] tracking-[0.28em] text-accent uppercase transition-colors hover:text-[var(--accent-dim)]"
            >
              Read Story →
            </Link>
          </ChamferedPanel>
          <span className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
            {formatPublishDate(coverPost.published_at)}
          </span>
        </div>
      </div>
    </section>
  );
}
