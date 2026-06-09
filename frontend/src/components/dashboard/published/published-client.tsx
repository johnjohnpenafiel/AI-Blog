"use client";

import { useCallback, useEffect, useState } from "react";

import {
  featurePost,
  getFeaturedPost,
  listPosts,
  unfeaturePost,
  type PostListItem,
} from "@/lib/api";

import { PublishedEmptyState } from "./published-empty-state";
import { PublishedRow } from "./published-row";

type LoadState = "loading" | "ready" | "error";

const PAGE_SIZE = 20;

export function PublishedClient() {
  const [items, setItems] = useState<PostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [featured, setFeatured] = useState<PostListItem | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [data, pinned] = await Promise.all([
          listPosts("published", { limit: PAGE_SIZE, offset: 0 }),
          getFeaturedPost(),
        ]);
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
        setFeatured(pinned);
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
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await listPosts("published", {
        limit: PAGE_SIZE,
        offset: items.length,
      });
      setItems((prev) => [...prev, ...data.items]);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }, [items.length, loadingMore]);

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

  const hasMore = items.length < total;

  return (
    <div className="flex flex-col gap-4">
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

      {loadState === "ready" && items.length === 0 && <PublishedEmptyState />}

      {loadState === "ready" && items.length > 0 && (
        <>
          {/* Glance state: what's on the homepage featured band right now. */}
          {featured ? (
            <div
              className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-dim)] pb-3"
              data-testid="featured-readout"
            >
              <span className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase">
                <span className="text-accent">★ Featured on homepage</span>
                <span className="text-muted normal-case tracking-normal">
                  — “{featured.title}”
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  void handleUnfeature(featured);
                }}
                disabled={busyId === featured.id}
                className="border border-border px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-muted uppercase transition-colors hover:text-fg disabled:opacity-50"
                data-testid="featured-readout-unfeature"
              >
                Unfeature
              </button>
            </div>
          ) : (
            <p
              className="border-b border-[var(--border-dim)] pb-3 font-mono text-[11px] tracking-[0.2em] text-[var(--text-dim)] uppercase"
              data-testid="featured-readout-empty"
            >
              {"// No post pinned — homepage shows the most recent dispatch"}
            </p>
          )}

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

          <ul className="flex flex-col gap-4">
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

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  void loadMore();
                }}
                disabled={loadingMore}
                className="border border-border px-4 py-2 font-mono text-[11px] tracking-[0.25em] text-muted uppercase transition-colors hover:text-fg disabled:opacity-50"
                data-testid="published-load-more"
              >
                {loadingMore ? "Loading…" : `Load more (${total - items.length} left)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
