import type { Metadata } from "next";

import { Hero } from "@/components/public/hero";
import { HeroEmpty } from "@/components/public/hero-empty";
import { PostsIndex } from "@/components/public/posts-index";
import { listPublicPosts } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Garage AI — AI in the automotive industry",
  description:
    "Twice-weekly dispatches on AI and operational technology reshaping the automotive industry.",
};

export default async function HomePage() {
  // SSR fetch — the page reflects the live DB state on every request.
  const { items: posts } = await listPublicPosts({ limit: 50 });
  const [coverPost, ...rest] = posts;

  return (
    <>
      {coverPost ? <Hero coverPost={coverPost} allPosts={posts} /> : <HeroEmpty />}
      <PostsIndex posts={rest} />
    </>
  );
}
