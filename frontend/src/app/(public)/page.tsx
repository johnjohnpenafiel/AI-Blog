import type { Metadata } from "next";

import { DispatchIndex } from "@/components/public/dispatch-index";
import { FeaturedStory } from "@/components/public/featured-story";
import { HeroIntro } from "@/components/public/hero-intro";
import { ReadingModes } from "@/components/public/reading-modes";
import {
  getFeaturedPost,
  listPublicPosts,
  type PublicPostListItem,
} from "@/lib/public-api";

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
      style={{
        display: "grid",
        gridTemplateColumns: "var(--tg-gutter) 1fr",
      }}
    >
      <div style={{ paddingLeft: 24, paddingTop: 48 }}>
        <span
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "var(--tg-faint)",
          }}
        >
          (00)
        </span>
      </div>
      <div style={{ padding: "48px 32px 64px 0" }}>
        <span className="tg-kicker">{"// The Index"}</span>
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
          Latest
          <br />
          Dispatches
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
  const [{ items: posts, total }, featured] = await Promise.all([
    listPublicPosts({ limit: 50 }),
    getFeaturedPost(),
  ]);

  if (posts.length === 0) return <EmptyIndex />;

  const coverPost = posts[0];
  const featuredPost = featured ?? coverPost;

  // group by format for the reading-modes band
  const byFormat: Record<string, PublicPostListItem[]> = {};
  for (const p of posts) {
    if (p.format) (byFormat[p.format] ??= []).push(p);
  }

  const sectionsCount = new Set(
    posts.map((p) => p.section).filter(Boolean),
  ).size;
  const formatsCount = new Set(posts.map((p) => p.format).filter(Boolean)).size;

  return (
    <>
      <HeroIntro
        coverPost={coverPost}
        totalCount={total}
        sectionsCount={sectionsCount}
        formatsCount={formatsCount}
      />
      <ReadingModes postsByFormat={byFormat} />
      <FeaturedStory post={featuredPost} />
      <DispatchIndex posts={posts} hotSlug={coverPost.slug} />
    </>
  );
}
