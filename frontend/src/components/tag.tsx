"use client";

import type { ReactNode } from "react";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { cn } from "@/lib/utils";

interface TagProps {
  label: ReactNode;
  active?: boolean;
  /**
   * `on-light` swaps to the darker accent (`--accent-dim`) and black text so
   * the tag has enough contrast on a light background (e.g. the public hero).
   * Default is tuned for the dark chassis.
   */
  variant?: "default" | "on-light";
  className?: string;
}

export function Tag({
  label,
  active = false,
  variant = "default",
  className,
}: TagProps) {
  const onLight = variant === "on-light";
  const perimeter = "var(--accent)";
  const inactiveText = onLight ? "text-black" : "text-muted";

  return (
    <ChamferedPanel
      tier="component"
      size="tag"
      background={active ? "var(--accent-glow)" : "transparent"}
      perimeterStroke={perimeter}
      chamferStroke="transparent"
      className={cn("inline-block", className)}
    >
      <span
        className={cn(
          "block px-2 py-1 font-mono text-[9px] tracking-[0.2em] uppercase whitespace-nowrap",
          active ? "text-accent" : inactiveText,
        )}
      >
        {label}
      </span>
    </ChamferedPanel>
  );
}
