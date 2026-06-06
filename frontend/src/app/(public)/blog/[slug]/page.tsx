import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DispatchBody } from "@/components/public/dispatch-body";
import { DispatchHeader } from "@/components/public/dispatch-header";
import { RelatedDispatches } from "@/components/public/related-dispatches";
import { SourcesList } from "@/components/public/sources-list";
import { SubscribeCta } from "@/components/public/subscribe-cta";
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
    related = [...sameSection, ...rest].slice(0, 3);
  } catch {
    related = [];
  }

  return (
    <>
      <DispatchHeader post={post} />

      {/* article body */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "var(--tg-gutter) 1fr",
          background: "var(--tg-bg)",
        }}
      >
        <div style={{ paddingLeft: 24, paddingTop: 44 }}>
          <span
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 11,
              letterSpacing: "0.1em",
              color: "var(--tg-faint)",
            }}
          >
            (01)
          </span>
        </div>
        <div style={{ padding: "44px var(--tg-content-pad) 8px 0" }}>
          <DispatchBody content={post.content} />
        </div>
      </div>

      <SourcesList sources={post.sources} />
      <RelatedDispatches posts={related} />
      <SubscribeCta />
    </>
  );
}
