"use client";

import { useCallback, useEffect, useState } from "react";

import { listPosts, type PostListItem } from "@/lib/api";

import { PublishedEmptyState } from "./published-empty-state";
import { PublishedRow } from "./published-row";

type LoadState = "loading" | "ready" | "error";

const PAGE_SIZE = 20;

export function PublishedClient() {
  const [items, setItems] = useState<PostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listPosts("published", {
          limit: PAGE_SIZE,
          offset: 0,
        });
        if (cancelled) return;
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
          <ul className="flex flex-col gap-4">
            {items.map((post) => (
              <li key={post.id}>
                <PublishedRow post={post} />
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
