"use client";

import { useEffect, useState } from "react";

import { getPipelineStatus, type PipelineStatus } from "@/lib/api";

const IDLE_POLL_MS = 30_000;
const RUNNING_POLL_MS = 5_000;

export function PipelineStatusDot() {
  const [status, setStatus] = useState<PipelineStatus["state"] | "unknown">(
    "unknown",
  );

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      try {
        const data = await getPipelineStatus();
        if (cancelled) return;
        setStatus(data.state);
        const next = data.state === "running" ? RUNNING_POLL_MS : IDLE_POLL_MS;
        timeoutId = setTimeout(tick, next);
      } catch {
        if (cancelled) return;
        // Hold the last known state on transient errors; retry on the long cadence.
        timeoutId = setTimeout(tick, IDLE_POLL_MS);
      }
    };

    tick();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const isRunning = status === "running";
  const label = isRunning ? "RUNNING" : "IDLE";
  const dotColor = isRunning ? "var(--accent)" : "var(--text-secondary)";

  return (
    <div
      className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase"
      data-testid="pipeline-status"
      data-state={status}
    >
      <span
        aria-hidden
        className="inline-block h-[7px] w-[7px]"
        style={{
          backgroundColor: isRunning ? undefined : dotColor,
          animation: isRunning
            ? "pulse-glow 1.2s ease-in-out infinite"
            : undefined,
        }}
      />
      <span style={{ color: dotColor }}>{label}</span>
    </div>
  );
}
