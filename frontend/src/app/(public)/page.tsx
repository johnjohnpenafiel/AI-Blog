import type { Metadata } from "next";

import { NewsIndex } from "@/components/public/news-index";
import { listPublicPosts } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Garage AI — AI as the dealership operating system",
  description:
    "Three dispatches a week on the artificial intelligence reshaping how automotive dealerships sell, service, and operate.",
};

/**
 * Homepage — the v5 News index (from the "The Garage AI v5" canvas): the full
 * dispatch archive as a filterable editorial row list. This IS the whole page;
 * the previous hero / reading-modes / featured bands were retired with the v5
 * redesign (see Design/decisions.md, 2026-07-18).
 */
export default async function HomePage() {
  // SSR fetch — the index reflects the live DB state on every request.
  const { items: posts } = await listPublicPosts({ limit: 50 });

  return <NewsIndex posts={posts} />;
}
