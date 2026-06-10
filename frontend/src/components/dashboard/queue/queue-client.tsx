"use client";

import { useCallback, useEffect, useState } from "react";

import { Pagination } from "@/components/dashboard/pagination";
import { useQueueCount } from "@/components/dashboard/queue-count-context";
import { SectionHeader } from "@/components/dashboard/section-header";
import { listPosts, type PostListItem } from "@/lib/api";

import { QueueCard } from "./queue-card";
import { QueueEmptyState } from "./queue-empty-state";
import { ReviewPanel } from "./review-panel";

type LoadState = "loading" | "ready" | "error";

const PAGE_SIZE = 10;

export function QueueClient() {
  const [items, setItems] = useState<PostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Bumped to force a refetch of the current page (after accept/reject/regenerate).
  const [reloadKey, setReloadKey] = useState(0);
  const { refresh: refreshCount } = useQueueCount();

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listPosts("pending_review", {
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        });
        if (cancelled) return;
        // If reviewing emptied the current page, step back to the last real one.
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
        setError(e instanceof Error ? e.message : "Failed to load queue");
        setLoadState("error");
      }
      if (!cancelled) refreshCount();
    })();
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey, refreshCount]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <div className="flex h-full flex-col gap-4">
      <SectionHeader index="01" label="Pending Review" />

      {loadState === "loading" && (
        <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          Loading queue…
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

      {loadState === "ready" && total === 0 && <QueueEmptyState />}

      {loadState === "ready" && items.length > 0 && (
        <>
          {/* Header (above) + pagination (below) stay pinned; only this scrolls. */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-2.5">
              {items.map((post) => (
                <li key={post.id}>
                  <QueueCard post={post} onOpen={setSelectedId} />
                </li>
              ))}
            </ul>
          </div>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}

      {selectedId && (
        <ReviewPanel
          postId={selectedId}
          onClose={() => setSelectedId(null)}
          onMutated={refresh}
        />
      )}
    </div>
  );
}
