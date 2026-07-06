import type { Metadata } from "next";

import { DispatchIndex } from "@/components/public/dispatch-index";
import { FeaturedStory } from "@/components/public/featured-story";
import { HeroIntro } from "@/components/public/hero-intro";
import { ReadingModes } from "@/components/public/reading-modes";
import {
  getFeaturedPost,
  listPublicPosts,
  type PublicFeaturedPost,
  type PublicPostListItem,
} from "@/lib/public-api";
import { computeWeekSchedule } from "@/lib/week-schedule";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Garage AI — AI as the dealership operating system",
  description:
    "Three dispatches a week on the artificial intelligence reshaping how automotive dealerships sell, service, and operate.",
};

/** Minimal index shown before the first post is published. */
function EmptyIndex() {
  return (
    <div
      className="tg-band"
      style={{}}
    >
      <div className="tg-band-content" style={{ padding: "48px 32px 64px 0" }}>
        <span className="tg-kicker">{"Operator-First · Proof-Over-Hype"}</span>
        <h1
          style={{
            fontFamily: "var(--tg-font-display)",
            fontWeight: 700,
            fontStretch: "118%",
            fontSize: "clamp(38px, 5.2vw, 76px)",
            lineHeight: 0.96,
            letterSpacing: "-0.02em",
            color: "var(--tg-ink)",
            margin: "16px 0 24px",
          }}
        >
          AI is remaking
          <br />
          the dealership.
        </h1>
        <p
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontSize: 12,
            letterSpacing: "0.06em",
            color: "var(--tg-mute)",
            textTransform: "uppercase",
          }}
        >
          {"// No dispatches published yet — the next drop is Monday at 08:00"}
        </p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  // SSR fetch — the index reflects the live DB state on every request. The
  // featured band is fetched alongside: it resolves the editor's-choice pin
  // (or the most-recent fallback) independently of the index window, so a
  // pinned older post still headlines the band. Hero + index stay newest-first.
  const [{ items: posts }, featured] = await Promise.all([
    listPublicPosts({ limit: 50 }),
    getFeaturedPost(),
  ]);

  if (posts.length === 0) return <EmptyIndex />;

  const coverPost = posts[0];
  // Keep the shape consistent (always a real PublicFeaturedPost) so the band
  // can tell an actual editor's pin apart from the recency fallback.
  const featuredPost: PublicFeaturedPost = featured ?? {
    ...coverPost,
    is_featured: false,
  };

  // group by format for the reading-modes band
  const byFormat: Record<string, PublicPostListItem[]> = {};
  for (const p of posts) {
    if (p.format) (byFormat[p.format] ??= []).push(p);
  }

  // Live weekly cadence for the hero masthead — which of this week's
  // Mon/Thu/Fri drops have landed, are upcoming, or passed without a post.
  const weekSchedule = computeWeekSchedule(posts);

  return (
    <>
      <HeroIntro coverPost={coverPost} weekSchedule={weekSchedule} />
      <ReadingModes postsByFormat={byFormat} />
      <FeaturedStory post={featuredPost} />
      <DispatchIndex posts={posts} hotSlug={coverPost.slug} />
    </>
  );
}
