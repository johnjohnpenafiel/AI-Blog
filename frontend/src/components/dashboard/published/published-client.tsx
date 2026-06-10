"use client";

import { useCallback, useEffect, useState } from "react";

import {
  featurePost,
  getFeaturedPost,
  listPosts,
  unfeaturePost,
  type PostListItem,
} from "@/lib/api";

import { Pagination } from "@/components/dashboard/pagination";
import { FeaturedSpotlight } from "@/components/dashboard/featured-spotlight";
import { SectionHeader } from "@/components/dashboard/section-header";

import { PublishedEmptyState } from "./published-empty-state";
import { PublishedRow } from "./published-row";

type LoadState = "loading" | "ready" | "error";

const PAGE_SIZE = 10;

export function PublishedClient() {
  const [items, setItems] = useState<PostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [featured, setFeatured] = useState<PostListItem | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Paged list — refetches whenever the page changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listPosts("published", {
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        });
        if (cancelled) return;
        const maxPage = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
        if (page > maxPage) {
          setPage(maxPage);
          return;
        }
        setItems(data.items);
        setTotal(data.total);
        setLoadState("ready");
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load published");
        setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  // The pinned post — fetched once (independent of the paged list).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pinned = await getFeaturedPost();
        if (!cancelled) setFeatured(pinned);
      } catch {
        // Non-fatal — the spotlight just shows its empty state.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFeature = useCallback(async (post: PostListItem) => {
    setBusyId(post.id);
    setActionMsg(null);
    try {
      await featurePost(post.id);
      // Single-pin: this post becomes featured, every other loaded row clears.
      setItems((prev) =>
        prev.map((p) => ({ ...p, is_featured: p.id === post.id })),
      );
      setFeatured({ ...post, is_featured: true });
      setActionMsg(`Featured “${post.title}” on the homepage.`);
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Failed to feature post.");
    } finally {
      setBusyId(null);
    }
  }, []);

  const handleUnfeature = useCallback(async (post: PostListItem) => {
    setBusyId(post.id);
    setActionMsg(null);
    try {
      await unfeaturePost(post.id);
      setItems((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, is_featured: false } : p,
        ),
      );
      setFeatured(null);
      setActionMsg("Cleared the featured post — homepage shows the most recent.");
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Failed to unfeature post.");
    } finally {
      setBusyId(null);
    }
  }, []);

  return (
    <div className="flex h-full flex-col gap-8">
      {loadState === "loading" && (
        <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          Loading published…
        </p>
      )}

      {loadState === "error" && error && (
        <p
          role="alert"
          className="font-mono text-xs tracking-[0.2em] text-destructive uppercase"
        >
          {error}
        </p>
      )}

      {loadState === "ready" && total === 0 && <PublishedEmptyState />}

      {loadState === "ready" && total > 0 && (
        <>
          {/* Featured: the post currently driving the homepage ★ band.
              Pinned — stays put while the list below scrolls in place. */}
          <section className="flex shrink-0 flex-col gap-4">
            <SectionHeader index="01" label="Featured" />
            <FeaturedSpotlight
              post={featured}
              onUnfeature={(p) => {
                void handleUnfeature(p);
              }}
              busy={featured ? busyId === featured.id : false}
            />
            {actionMsg && (
              <p
                role="status"
                aria-live="polite"
                className="font-mono text-[11px] tracking-[0.15em] text-muted"
                data-testid="featured-action-msg"
              >
                {actionMsg}
              </p>
            )}
          </section>

          {/* All Published: header + pagination stay pinned; the list scrolls. */}
          <section className="flex min-h-0 flex-1 flex-col gap-4">
            <SectionHeader index="02" label="All Published" />
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ul className="flex flex-col gap-2.5">
                {items.map((post) => (
                  <li key={post.id}>
                    <PublishedRow
                      post={post}
                      onFeature={(p) => {
                        void handleFeature(p);
                      }}
                      onUnfeature={(p) => {
                        void handleUnfeature(p);
                      }}
                      busy={busyId === post.id}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </section>
        </>
      )}
    </div>
  );
}
