import Link from "next/link";
import { Fragment } from "react";

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
      className="relative isolate min-h-[640px] overflow-hidden bg-bg lg:min-h-screen lg:bg-transparent"
    >
{/* Content — constrained to the left half so it clears the figure. */}
      <div className="relative flex min-h-[640px] flex-col justify-start gap-8 px-6 pt-20 pb-12 sm:gap-10 sm:px-10 sm:pt-24 sm:pb-14 lg:min-h-screen lg:w-[55%] lg:gap-12 lg:px-16 lg:pt-28 lg:pb-16">
        <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-white uppercase">
          <span>{"// COVER STORY"}</span>
          <span className="hidden h-px w-10 bg-white/20 sm:block" />
          <span>{issueLabel.formatted}</span>
        </div>

        <h1 className="max-w-[760px] font-display text-[30px] leading-[1.1] font-bold tracking-[0.01em] text-white sm:text-[38px] md:text-[46px] lg:text-[54px] xl:text-[64px]">
          {coverPost.title.split(" ").map((word, i, arr) => {
            // Two-tone: all-caps acronyms (AI, CRM, OT, etc.) take the accent
            // color so the technical terms pop against the white title body.
            const isAcronym = /^[A-Z]{2,}$/.test(word);
            return (
              <Fragment key={i}>
                <span className={isAcronym ? "text-accent" : undefined}>
                  {word}
                </span>
                {i < arr.length - 1 ? " " : ""}
              </Fragment>
            );
          })}
        </h1>

        <p className="max-w-none font-sans text-[17px] leading-[1.6] text-white lg:max-w-2xl">
          {coverPost.summary}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {coverPost.tags.map((tag) => (
            <Tag
              key={tag}
              label={tag}
              variant="on-dark-prominent"
              size="md"
            />
          ))}
          <span className="font-mono text-[13px] tracking-[0.25em] text-white uppercase">
            {`${coverPost.read_time_minutes} MIN READ`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <ChamferedPanel
            tier="component"
            size="button"
            cut="dual"
            background="var(--accent)"
            perimeterStroke="transparent"
          >
            <Link
              href={`/blog/${coverPost.slug}`}
              data-testid="hero-cta"
              className="block px-8 py-4 font-mono text-[13px] tracking-[0.28em] text-[#0a0a0a] uppercase"
            >
              Read Story →
            </Link>
          </ChamferedPanel>
          <span className="font-mono text-[13px] tracking-[0.25em] text-white uppercase">
            {formatPublishDate(coverPost.published_at)}
          </span>
        </div>
      </div>
    </section>
  );
}
