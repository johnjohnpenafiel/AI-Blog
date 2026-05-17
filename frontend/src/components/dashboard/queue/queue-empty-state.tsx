"use client";

import { useEffect, useState } from "react";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { getPipelineStatus, type PipelineStatus } from "@/lib/api";

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Math.max(0, Date.now() - then);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatAbsolute(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "—", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "—", time: "" };
  const date = d
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
    })
    .toUpperCase();
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return { date, time };
}

export function QueueEmptyState() {
  const [status, setStatus] = useState<PipelineStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getPipelineStatus();
        if (cancelled) return;
        setStatus(data);
      } catch {
        // Hold null — UI shows em-dashes.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const lastRun = formatRelative(status?.last_run_at ?? null);
  const nextRun = formatAbsolute(status?.next_run_at ?? null);

  return (
    <ChamferedPanel
      tier="component"
      size="card"
      className="w-full"
      data-testid="queue-empty-state"
    >
      <div className="px-6 py-8 md:px-8">
        <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
          {"// Queue empty"}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Posts awaiting your review will appear here.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 border-t border-border-dim pt-6 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[9px] tracking-[0.25em] text-dim uppercase">
              Last run
            </span>
            <span className="font-mono text-[14px] tracking-[0.05em] text-fg uppercase">
              {lastRun}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[9px] tracking-[0.25em] text-dim uppercase">
              Next run
            </span>
            <div>
              <div className="font-mono text-[14px] tracking-[0.05em] text-fg uppercase">
                {nextRun.date}
              </div>
              {nextRun.time && (
                <div className="font-mono text-[11px] tracking-[0.2em] text-accent">
                  {nextRun.time}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[9px] tracking-[0.25em] text-dim uppercase">
              Publishing mode
            </span>
            <span className="font-mono text-[14px] tracking-[0.05em] text-accent uppercase">
              Approve only
            </span>
          </div>
        </div>
      </div>
    </ChamferedPanel>
  );
}
