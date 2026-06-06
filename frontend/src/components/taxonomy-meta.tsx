import type { PostListItem } from "@/lib/api";
import { cn } from "@/lib/utils";

type TaxonomyFields = Pick<PostListItem, "section" | "format" | "story_type">;

/**
 * The post's classification row — section · format · story_type — as a compact
 * mono line. Admin-only (dashboard); part of the per-post "dataset row" the
 * operator eyeballs. Nulls are skipped; renders nothing if all are unset.
 */
export function TaxonomyMeta({
  post,
  className,
}: {
  post: TaxonomyFields;
  className?: string;
}) {
  const parts = [post.section, post.format, post.story_type].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <span
      data-testid="taxonomy-meta"
      className={cn(
        "block font-mono text-[9px] tracking-[0.2em] text-dim uppercase",
        className,
      )}
    >
      {parts.join(" · ")}
    </span>
  );
}
