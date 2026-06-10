"use client";

import { useCallback, useEffect, useState } from "react";

import { useQueueCount } from "@/components/dashboard/queue-count-context";
import { SectionHeader } from "@/components/dashboard/section-header";
import { listPosts, type PostListItem } from "@/lib/api";

import { ScheduledCard } from "./scheduled-card";
import { ScheduledEmptyState } from "./scheduled-empty-state";

type LoadState = "loading" | "ready" | "error";

function bySchedule(a: PostListItem, b: PostListItem): number {
  const ax = a.scheduled_at ? new Date(a.scheduled_at).getTime() : Infinity;
  const bx = b.scheduled_at ? new Date(b.scheduled_at).getTime() : Infinity;
  return ax - bx;
}

export function ScheduledClient() {
  const [items, setItems] = useState<PostListItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const { refresh: refreshCount } = useQueueCount();

  const refresh = useCallback(async () => {
    try {
      const data = await listPosts("accepted");
      setItems([...data.items].sort(bySchedule));
      setLoadState("ready");
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load scheduled");
      setLoadState("error");
    }
    refreshCount();
  }, [refreshCount]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listPosts("accepted");
        if (cancelled) return;
        setItems([...data.items].sort(bySchedule));
        setLoadState("ready");
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load scheduled");
        setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader index="01" label="Scheduled" />

      {loadState === "loading" && (
        <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          Loading scheduled…
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

      {loadState === "ready" && items.length === 0 && <ScheduledEmptyState />}

      {loadState === "ready" && items.length > 0 && (
        <ul className="flex flex-col gap-4">
          {items.map((post) => (
            <li key={post.id}>
              <ScheduledCard
                post={post}
                onMutated={() => {
                  void refresh();
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
