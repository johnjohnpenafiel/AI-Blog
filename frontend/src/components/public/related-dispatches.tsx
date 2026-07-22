import type { PublicPostListItem } from "@/lib/public-api";

import { DispatchCard } from "./dispatch-card";

/**
 * "/ Related articles" band — a two-up gallery of console-window dispatch
 * cards (see dispatch-card.tsx), split by a bright dashed divider. Bound to
 * live posts the page picks (same section first, then most recent).
 */
export function RelatedDispatches({ posts }: { posts: PublicPostListItem[] }) {
  if (posts.length === 0) return null;
  return (
    <div className="tg-band-sec">
      <div className="tg-seclabel">/ Related articles</div>
      <div className="tg-relgrid">
        {posts.map((post) => (
          <DispatchCard key={post.slug} post={post} imageUrl={post.image_url} />
        ))}
      </div>
    </div>
  );
}
