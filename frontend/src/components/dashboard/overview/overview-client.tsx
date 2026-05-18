"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useQueueCount } from "@/components/dashboard/queue-count-context";
import {
  getPipelineStatus,
  listPosts,
  type PipelineStatus,
} from "@/lib/api";
import {
  formatRelative,
  formatTimeOfDay,
  formatWeekdayDateUpper,
} from "@/lib/utils";

import { GoToQueueButton } from "./go-to-queue-button";
import { StatCard } from "./stat-card";
import { TriggerPipelineButton } from "./trigger-pipeline-button";

type LoadState = "loading" | "ready" | "error";

const IDLE_POLL_MS = 30_000;
const RUNNING_POLL_MS = 5_000;

async function fetchPublishedTotal(): Promise<number> {
  const data = await listPosts("published", { limit: 1, offset: 0 });
  return data.total;
}

export function OverviewClient() {
  const { count: pendingCount, refresh: refreshPending } = useQueueCount();

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStatus | null>(null);
  const [publishedCount, setPublishedCount] = useState<number | null>(null);

  const prevStateRef = useRef<PipelineStatus["state"] | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const next = await getPipelineStatus();
        if (cancelled) return;
        const prev = prevStateRef.current;
        prevStateRef.current = next.state;
        setPipeline(next);

        if (prev === "running" && next.state === "idle") {
          try {
            const total = await fetchPublishedTotal();
            if (!cancelled) setPublishedCount(total);
          } catch {
            // Non-fatal — counts will catch up on next transition.
          }
          refreshPending();
        }

        const delay =
          next.state === "running" ? RUNNING_POLL_MS : IDLE_POLL_MS;
        timeoutId = setTimeout(poll, delay);
      } catch {
        if (cancelled) return;
        timeoutId = setTimeout(poll, IDLE_POLL_MS);
      }
    };

    void (async () => {
      try {
        const [status, total] = await Promise.all([
          getPipelineStatus(),
          fetchPublishedTotal(),
        ]);
        if (cancelled) return;
        setPipeline(status);
        setPublishedCount(total);
        prevStateRef.current = status.state;
        setLoadState("ready");
        const delay =
          status.state === "running" ? RUNNING_POLL_MS : IDLE_POLL_MS;
        timeoutId = setTimeout(poll, delay);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load overview");
        setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [refreshPending]);

  const handlePipelineStarted = useCallback(() => {
    setPipeline((p) =>
      p
        ? { ...p, state: "running" }
        : { last_run_at: null, next_run_at: null, state: "running" },
    );
    prevStateRef.current = "running";
  }, []);

  const handlePipelineCompleted = useCallback(
    () => {
      void (async () => {
        try {
          const [status, total] = await Promise.all([
            getPipelineStatus(),
            fetchPublishedTotal(),
          ]);
          setPipeline(status);
          setPublishedCount(total);
          prevStateRef.current = status.state;
        } catch {
          // Non-fatal: the polling loop will catch up.
        }
        refreshPending();
      })();
    },
    [refreshPending],
  );

  if (loadState === "loading") {
    return (
      <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
        Loading overview…
      </p>
    );
  }

  if (loadState === "error") {
    return (
      <p
        role="alert"
        className="font-mono text-xs tracking-[0.2em] text-destructive uppercase"
      >
        {error ?? "Failed to load overview"}
      </p>
    );
  }

  const lastRunAt = pipeline?.last_run_at ?? null;
  const nextRunAt = pipeline?.next_run_at ?? null;
  const pending = pendingCount ?? 0;
  const published = publishedCount ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Posts Published"
          value={published}
          testId="stat-posts-published"
        />
        <StatCard
          label="Pending Review"
          value={pending}
          activated={pending > 0}
          testId="stat-pending-review"
        />
        <StatCard
          label="Last Run"
          value={formatRelative(lastRunAt)}
          valueClassName="font-display text-[22px] font-semibold"
          testId="stat-last-run"
        />
        <StatCard
          label="Next Run"
          value={formatWeekdayDateUpper(nextRunAt)}
          valueClassName="font-display text-[22px] font-semibold"
          subLine={
            nextRunAt ? (
              <span className="text-accent">{formatTimeOfDay(nextRunAt)}</span>
            ) : null
          }
          testId="stat-next-run"
        />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <TriggerPipelineButton
          onStarted={handlePipelineStarted}
          onCompleted={handlePipelineCompleted}
        />
        {pending > 0 && <GoToQueueButton />}
      </div>
    </div>
  );
}
