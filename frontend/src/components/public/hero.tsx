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
      <video
        src="/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 -z-20 size-full object-cover object-center"
      />

      <GlowOrb
        size={780}
        className="-top-40 right-[-12rem] opacity-90 sm:right-[-6rem]"
      />

      <div className="relative flex min-h-screen flex-col justify-between px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 bg-black/45 px-3 py-2 font-mono text-[10px] tracking-[0.25em] uppercase shadow-[0_0_0_1px_var(--border-dim)] backdrop-blur-md">
            <span className="text-accent">{"// COVER STORY"}</span>
            <span className="hidden h-px w-10 bg-[var(--border-dim)] sm:block" />
            <span className="text-muted">{issueLabel.formatted}</span>
          </div>
          <div className="flex items-center gap-2 self-start bg-black/45 px-3 py-2 font-mono text-[10px] tracking-[0.25em] uppercase shadow-[0_0_0_1px_var(--border-dim)] backdrop-blur-md sm:self-auto">
            <span
              aria-hidden
              className="inline-block size-[7px] bg-accent"
              style={{ boxShadow: "0 0 10px rgb(255 106 0 / 0.6)" }}
            />
            <span className="text-muted">LIVE FEED</span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-8">
          <h1 className="max-w-3xl font-display text-[28px] leading-[1.1] font-bold tracking-[0.01em] text-fg drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)] sm:text-[34px] md:text-[40px] lg:text-[46px] xl:text-[52px]">
            {coverPost.title}
          </h1>

          <div className="h-px w-full bg-[var(--border-dim)]" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="flex max-w-3xl flex-col gap-5">
              <p className="bg-black/45 px-4 py-3 font-mono text-[11px] leading-[1.6] tracking-[0.18em] text-muted uppercase shadow-[0_0_0_1px_var(--border-dim)] backdrop-blur-md">
                {coverPost.summary}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {coverPost.tags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
                <span className="bg-black/45 px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-muted uppercase shadow-[0_0_0_1px_var(--border-dim)] backdrop-blur-md">
                  {coverPost.read_time_minutes} MIN READ
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
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
              <span className="bg-black/45 px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-muted uppercase shadow-[0_0_0_1px_var(--border-dim)] backdrop-blur-md">
                {formatPublishDate(coverPost.published_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
