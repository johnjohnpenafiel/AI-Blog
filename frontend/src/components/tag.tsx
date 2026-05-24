"use client";

import type { ReactNode } from "react";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { cn } from "@/lib/utils";

interface TagProps {
  label: ReactNode;
  active?: boolean;
  /**
   * - `default`           — muted gray text, tuned for the dark chassis.
   * - `on-light`          — black text, for use on light backgrounds.
   * - `on-dark-prominent` — white text, for prominent placements on dark
   *                         backgrounds (e.g. the public hero).
   */
  variant?: "default" | "on-light" | "on-dark-prominent";
  /**
   * - `sm` (default) — compact chip used in post cards, filter rows, etc.
   * - `md`           — slightly larger chip for prominent placements like
   *                    the public hero.
   */
  size?: "sm" | "md";
  className?: string;
}

export function Tag({
  label,
  active = false,
  variant = "default",
  size = "sm",
  className,
}: TagProps) {
  const perimeter = "var(--accent)";
  const inactiveText =
    variant === "on-light"
      ? "text-black"
      : variant === "on-dark-prominent"
        ? "text-white"
        : "text-muted";
  const sizeClasses =
    size === "md"
      ? "px-3 py-1.5 text-[11px]"
      : "px-2 py-1 text-[9px]";

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
          "block font-mono tracking-[0.2em] uppercase whitespace-nowrap",
          sizeClasses,
          active ? "text-accent" : inactiveText,
        )}
      >
        {label}
      </span>
    </ChamferedPanel>
  );
}
