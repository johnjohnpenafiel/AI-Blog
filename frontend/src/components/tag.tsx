"use client";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { cn } from "@/lib/utils";

interface TagProps {
  label: string;
  active?: boolean;
  className?: string;
}

export function Tag({ label, active = false, className }: TagProps) {
  return (
    <ChamferedPanel
      tier="component"
      size="tag"
      background={active ? "var(--accent-glow)" : "transparent"}
      perimeterStroke="var(--accent)"
      chamferStroke="transparent"
      className={cn("inline-block", className)}
    >
      <span
        className={cn(
          "block px-2 py-1 font-mono text-[9px] tracking-[0.2em] uppercase whitespace-nowrap",
          active ? "text-accent" : "text-muted",
        )}
      >
        {label}
      </span>
    </ChamferedPanel>
  );
}
