import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PostBody } from "@/components/public/post-body";
import { ShareBar } from "@/components/public/share-bar";
import { SourcesList } from "@/components/public/sources-list";
import { Tag } from "@/components/tag";
import { getPublicPost, NotFoundError } from "@/lib/public-api";

export const dynamic = "force-dynamic";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

function formatPublishDate(iso: string): string {
  try {
    return new Date(iso)
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

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPublicPost(slug);
    return {
      title: `${post.title} — DeLorean`,
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
    return { title: "Post — DeLorean" };
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

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-display text-[36px] font-bold leading-[1.08] tracking-[0.01em] text-fg sm:text-[44px] md:text-[52px]">
          {post.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-[var(--border-dim)] pb-6">
          <span className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
            {formatPublishDate(post.published_at)}
          </span>
          <span className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
            {post.read_time_minutes} min read
          </span>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <PostBody content={post.content} />

      {/* Share */}
      <ShareBar title={post.title} slug={post.slug} />

      {/* Sources */}
      <SourcesList sources={post.sources} />
    </article>
  );
}
