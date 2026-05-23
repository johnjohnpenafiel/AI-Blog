import Link from "next/link";
import { Fragment } from "react";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { DecodingText } from "@/components/decoding-text";
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
      className="relative isolate min-h-[640px] overflow-hidden bg-[#f3f3f3] lg:min-h-screen lg:bg-transparent"
    >
      {/* Background video — desktop only. Plays once on load and naturally
          holds the last frame (no `loop`). `muted` + `playsInline` are required
          for autoplay across browsers. Refresh re-plays it. */}
      <video
        src="/hero-bg.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden
        className="absolute top-0 left-0 -z-20 hidden h-screen w-full object-cover object-[80%_center] lg:block"
      />

      {/* Subtle tint above the video — knocks the bright whites down a notch
          for better text contrast without obscuring the figure. Desktop only,
          since mobile's flat background is already slightly muted. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden bg-black/[0.06] lg:block"
      />

      {/* Vertical chrome — version + broadcast schedule, right edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-20 right-4 z-10 hidden flex-col items-center gap-4 sm:top-24 sm:right-6 sm:flex lg:top-28 lg:right-8"
      >
        <span
          className="font-mono text-[10px] tracking-[0.32em] text-black uppercase whitespace-nowrap"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
          }}
        >
          V.1.0&nbsp;&nbsp;/&nbsp;&nbsp;MON·THU·08:00
        </span>
        <span className="h-12 w-px bg-[#1a1a1a]/40" />
      </div>

      {/* Content — constrained to the left half so it clears the figure. */}
      <div className="relative flex min-h-[640px] flex-col justify-start gap-6 px-6 pt-20 pb-12 sm:gap-8 sm:px-10 sm:pt-24 sm:pb-14 lg:min-h-screen lg:w-[55%] lg:gap-10 lg:px-16 lg:pt-28 lg:pb-16">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] uppercase">
          <span className="text-accent">
            <DecodingText>{"// COVER STORY"}</DecodingText>
          </span>
          <span className="hidden h-px w-10 bg-[#1a1a1a]/30 sm:block" />
          <span className="text-black">
            <DecodingText>{issueLabel.formatted}</DecodingText>
          </span>
        </div>

        <ChamferedPanel
          tier="component"
          size="card"
          background="#000"
          className="max-w-[640px]"
        >
          <h1 className="relative px-5 py-3 font-display text-[22px] leading-[1.1] font-bold tracking-[0.01em] text-white sm:text-[28px] md:text-[36px] lg:text-[40px] xl:text-[48px]">
          {/* Skeleton + word stagger — desktop only. On mobile the figure
              isn't shown, so there's no "scanning" narrative to support. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden flex-col justify-center gap-[0.3em] px-4 py-3 lg:motion-safe:flex lg:motion-safe:[animation:hero-skeleton-out_0.3s_ease-out_2.7s_forwards]"
          >
            {[85, 100, 65].map((w, i) => (
              <span
                key={i}
                className="block h-[0.35em] lg:motion-safe:[animation:hero-skeleton-shimmer_1.8s_linear_infinite]"
                style={{
                  width: `${w}%`,
                  backgroundImage:
                    "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.08) 100%)",
                  backgroundSize: "200% 100%",
                  animationDelay: `${i * 200}ms`,
                }}
              />
            ))}
          </span>

          {coverPost.title.split(" ").map((word, i, arr) => (
            <Fragment key={i}>
              <span
                className="inline-block lg:motion-safe:opacity-0 lg:motion-safe:[animation:hero-title-word-in_0.45s_ease-out_forwards]"
                style={{ animationDelay: `${3000 + i * 80}ms` }}
              >
                {word}
              </span>
              {i < arr.length - 1 ? " " : ""}
            </Fragment>
          ))}
        </h1>
        </ChamferedPanel>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.25em] text-black uppercase">
            <DecodingText>{"// SUMMARY"}</DecodingText>
          </span>
          <span className="h-px flex-1 bg-[#1a1a1a]/40" />
        </div>

        <p className="max-w-none font-mono text-[11px] leading-[1.6] tracking-[0.18em] text-black uppercase lg:max-w-xl">
          <DecodingText>{coverPost.summary}</DecodingText>
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {coverPost.tags.map((tag) => (
            <Tag
              key={tag}
              label={<DecodingText>{tag}</DecodingText>}
              variant="on-light"
            />
          ))}
          <span className="font-mono text-[10px] tracking-[0.25em] text-black uppercase">
            <DecodingText>{`${coverPost.read_time_minutes} MIN READ`}</DecodingText>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
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
              className="block px-6 py-3 font-mono text-[11px] tracking-[0.28em] text-[#0a0a0a] uppercase"
            >
              <DecodingText>{"Read Story →"}</DecodingText>
            </Link>
          </ChamferedPanel>
          <span className="font-mono text-[10px] tracking-[0.25em] text-black uppercase">
            <DecodingText>{formatPublishDate(coverPost.published_at)}</DecodingText>
          </span>
        </div>
      </div>
    </section>
  );
}
