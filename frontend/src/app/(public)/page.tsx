import type { Metadata } from "next";

import { HomeLanding } from "@/components/public/home-landing";
import { NewsIndex } from "@/components/public/news-index";
import { StatsTicker } from "@/components/public/stats-ticker";
import { getFeaturedPost, listPublicPosts } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Garage AI — AI as the dealership operating system",
  description:
    "Three dispatches a week on the artificial intelligence reshaping how automotive dealerships sell, service, and operate.",
};

/**
 * Homepage — a landing composition above the v5 News index: the masthead
 * wordmark acts as the headline, then a large editorial lede (what the site
 * is) and a "/ Featured post" · "/ Latest post" two-up spotlight
 * (home-landing.tsx), with the full filterable dispatch archive
 * (news-index.tsx) below.
 */
export default async function HomePage() {
  // SSR fetch — the page reflects the live DB state on every request.
  const [{ items: posts, total }, featured] = await Promise.all([
    listPublicPosts({ limit: 50 }),
    getFeaturedPost(),
  ]);
  // The newest dispatch that isn't already in the featured slot (when the
  // featured post IS the newest — the no-pin fallback — this is the runner-up).
  const latest = featured
    ? (posts.find((p) => p.slug !== featured.slug) ?? null)
    : null;

  return (
    <>
      <HomeLanding featured={featured} latest={latest} total={total} />
      <StatsTicker posts={posts} total={total} />
      <NewsIndex posts={posts} />
    </>
  );
}
