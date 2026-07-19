import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PostView } from "@/components/public/post-view";
import { RelatedDispatches } from "@/components/public/related-dispatches";
import {
  getPublicPost,
  listPublicPosts,
  NotFoundError,
  type PublicPostListItem,
} from "@/lib/public-api";

export const dynamic = "force-dynamic";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPublicPost(slug);
    return {
      title: `${post.title} — The Garage AI`,
      description: post.meta_description,
      openGraph: {
        title: post.title,
        description: post.meta_description,
        type: "article",
        url: `/blog/${post.slug}`,
        publishedTime: post.published_at,
      },
      twitter: {
        card: "summary",
        title: post.title,
        description: post.meta_description,
      },
    };
  } catch {
    return { title: "Dispatch — The Garage AI" };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await getPublicPost(slug);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  // Related dispatches: other published posts, same section first, then recent.
  let related: PublicPostListItem[] = [];
  try {
    const { items } = await listPublicPosts({ limit: 12 });
    const others = items.filter((p) => p.slug !== slug);
    const sameSection = others.filter(
      (p) => post.section != null && p.section === post.section,
    );
    const rest = others.filter(
      (p) => !(post.section != null && p.section === post.section),
    );
    related = [...sameSection, ...rest].slice(0, 2);
  } catch {
    related = [];
  }

  return (
    <div className="tg-post-scale">
      <PostView post={post} />
      <RelatedDispatches posts={related} />
    </div>
  );
}
