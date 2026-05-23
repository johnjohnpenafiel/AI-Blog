import Link from "next/link";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { Tag } from "@/components/tag";
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
      {/* Background image — natural scale, anchored right so figure shifts left. */}
      <img
        src="/hero-bg.png"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 size-full object-cover object-[80%_center]"
      />

      {/* Vertical chrome — version + broadcast schedule, right edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-4 bottom-24 z-10 hidden flex-col items-center gap-4 sm:right-6 sm:flex lg:right-8"
      >
        <span
          className="font-mono text-[10px] tracking-[0.32em] text-[#333] uppercase whitespace-nowrap"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          V.1.0&nbsp;&nbsp;/&nbsp;&nbsp;MON·THU·08:00
        </span>
        <span className="h-12 w-px bg-[#1a1a1a]/40" />
      </div>

      {/* Content — constrained to the left half so it clears the figure */}
      <div className="relative flex min-h-screen flex-col justify-center gap-8 px-6 pt-28 pb-16 sm:px-10 sm:gap-10 lg:px-16 lg:w-[55%]">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] uppercase">
            <span className="text-accent">{"// COVER STORY"}</span>
            <span className="hidden h-px w-10 bg-[#1a1a1a]/30 sm:block" />
            <span className="text-[#333]">{issueLabel.formatted}</span>
          </div>
        </div>

        <h1 className="font-display text-[34px] leading-[1.1] font-bold tracking-[0.01em] text-[#0a0a0a] sm:text-[40px] md:text-[48px] lg:text-[56px] xl:text-[64px]">
          {coverPost.title}
        </h1>

        <div className="h-px w-full bg-[#1a1a1a]/40" />

        <p className="max-w-xl font-mono text-[11px] leading-[1.6] tracking-[0.18em] text-[#333] uppercase">
          {coverPost.summary}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {coverPost.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
          <span className="font-mono text-[10px] tracking-[0.25em] text-[#333] uppercase">
            {coverPost.read_time_minutes} MIN READ
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <ChamferedPanel
            tier="component"
            size="button"
            cut="dual"
            background="transparent"
            perimeterStroke="var(--accent)"
          >
            <Link
              href={`/blog/${coverPost.slug}`}
              data-testid="hero-cta"
              className="block px-8 py-4 font-mono text-[12px] tracking-[0.28em] text-accent uppercase transition-colors hover:text-[var(--accent-dim)]"
            >
              Read Story →
            </Link>
          </ChamferedPanel>
          <span className="font-mono text-[10px] tracking-[0.25em] text-[#333] uppercase">
            {formatPublishDate(coverPost.published_at)}
          </span>
        </div>
      </div>
    </section>
  );
}
