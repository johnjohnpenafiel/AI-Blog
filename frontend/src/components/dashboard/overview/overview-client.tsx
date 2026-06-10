"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { FeaturedSpotlight } from "@/components/dashboard/featured-spotlight";
import { useQueueCount } from "@/components/dashboard/queue-count-context";
import { SectionHeader } from "@/components/dashboard/section-header";
import {
  getFeaturedPost,
  getPipelineStatus,
  getSettings,
  listPosts,
  type PipelineStatus,
  type PostListItem,
  type PublishingMode,
} from "@/lib/api";
import {
  formatRelative,
  formatTimeOfDay,
  formatWeekdayDateUpper,
} from "@/lib/utils";

import { GoToQueueButton } from "./go-to-queue-button";
import { StatusList } from "./status-list";
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
  const [featured, setFeatured] = useState<PostListItem | null>(null);
  const [mode, setMode] = useState<PublishingMode | null>(null);

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
        const [status, total, pinned] = await Promise.all([
          getPipelineStatus(),
          fetchPublishedTotal(),
          getFeaturedPost(),
        ]);
        if (cancelled) return;
        setPipeline(status);
        setPublishedCount(total);
        setFeatured(pinned);
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

  // Publishing mode — fetched on its own, non-fatal: a settings hiccup just
  // leaves the Mode card showing "—" rather than blanking the whole overview.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const settings = await getSettings();
        if (!cancelled) setMode(settings.publishing_mode);
      } catch {
        // Non-fatal — Mode card falls back to "—".
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    <div className="flex min-h-full flex-col gap-10">
      {/* Status + Quick Actions share the top row on desktop — the status
          readout only needs ~half the width, so the actions fill the rest.
          They stack below lg. */}
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <section className="flex flex-col gap-5 lg:w-[28rem] lg:shrink-0">
          <SectionHeader index="01" label="Status" />
          <StatusList
            items={[
            {
              label: "Posts Published",
              value: published,
              testId: "stat-posts-published",
            },
            {
              label: "Pending Review",
              value: pending,
              activated: pending > 0,
              testId: "stat-pending-review",
            },
            {
              label: "Mode",
              value: mode
                ? mode === "auto"
                  ? "Auto"
                  : "Approve Only"
                : "—",
              testId: "stat-mode",
            },
            {
              label: "Last Run",
              value: formatRelative(lastRunAt),
              testId: "stat-last-run",
            },
            {
              label: "Next Run",
              value: nextRunAt
                ? `${formatWeekdayDateUpper(nextRunAt)} · ${formatTimeOfDay(nextRunAt)}`
                : "—",
              testId: "stat-next-run",
            },
            ]}
          />
        </section>

        <section className="flex flex-col gap-5 lg:flex-1">
          <SectionHeader index="02" label="Quick Actions" />
          <div className="flex flex-wrap items-start gap-3">
            <TriggerPipelineButton
              onStarted={handlePipelineStarted}
              onCompleted={handlePipelineCompleted}
            />
            <GoToQueueButton dim={pending === 0} />
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-5">
        <SectionHeader index="03" label="Featured" />
        <FeaturedSpotlight post={featured} />
      </section>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border-dim pt-5 font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
        <span>The Garage AI v2</span>
        <span>Built by John John</span>
      </footer>
    </div>
  );
}
