"use client";

import { useCallback, useEffect, useState } from "react";

import { useQueueCount } from "@/components/dashboard/queue-count-context";
import { listPosts, type PostListItem } from "@/lib/api";

import { QueueCard } from "./queue-card";
import { QueueEmptyState } from "./queue-empty-state";
import { ReviewPanel } from "./review-panel";

type LoadState = "loading" | "ready" | "error";

export function QueueClient() {
  const [items, setItems] = useState<PostListItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { refresh: refreshCount } = useQueueCount();

  const refresh = useCallback(async () => {
    try {
      const data = await listPosts("pending_review");
      setItems(data.items);
      setLoadState("ready");
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load queue");
      setLoadState("error");
    }
    refreshCount();
  }, [refreshCount]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listPosts("pending_review");
        if (cancelled) return;
        setItems(data.items);
        setLoadState("ready");
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load queue");
        setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
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

      {loadState === "ready" && items.length === 0 && <QueueEmptyState />}

      {loadState === "ready" && items.length > 0 && (
        <ul className="flex flex-col gap-4">
          {items.map((post) => (
            <li key={post.id}>
              <QueueCard post={post} onOpen={setSelectedId} />
            </li>
          ))}
        </ul>
      )}

      {selectedId && (
        <ReviewPanel
          postId={selectedId}
          onClose={() => setSelectedId(null)}
          onMutated={() => {
            void refresh();
          }}
        />
      )}
    </div>
  );
}
