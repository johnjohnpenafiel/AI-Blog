"use client";

import type { CSSProperties } from "react";

import { usePipelineStatus } from "./pipeline-status-context";

const STATES = {
  idle: { label: "IDLE", color: "var(--text-secondary)", glow: null },
  preparing: { label: "PREPARING", color: "var(--warning)", glow: "rgb(255 154 64 / 0.85)" },
  running: { label: "RUNNING", color: "var(--success)", glow: "rgb(0 196 125 / 0.85)" },
} as const;

export function PipelineStatusDot() {
  const { state } = usePipelineStatus();
  const s = STATES[state];

  const dotStyle: CSSProperties = { backgroundColor: s.color };
  if (s.glow) {
    (dotStyle as Record<string, string>)["--status-glow"] = s.glow;
    dotStyle.animation = "status-pulse 1.4s ease-in-out infinite";
  }

  return (
    <div
      className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase"
      data-testid="pipeline-status"
      data-state={state}
    >
      {/* Only the square changes color; the label stays a constant gray. */}
      <span
        aria-hidden
        className="inline-block h-[9px] w-[9px]"
        style={dotStyle}
      />
      <span>{s.label}</span>
    </div>
  );
}
