import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface StatItem {
  label: string;
  value: ReactNode;
  /** Tint the row accent (e.g. Pending Review when > 0). */
  activated?: boolean;
  testId?: string;
}

/**
 * The Status readout as a single vertical card — one metric per row, label on
 * the left, value on the right, divided by hairlines. A terminal/HUD readout:
 * every value renders at the same size and weight, so a short count ("12")
 * sits in balance with a text value ("Approve Only") instead of looking lost.
 */
export function StatusList({ items }: { items: StatItem[] }) {
  return (
    <div className="max-w-md divide-y divide-border-dim border border-border bg-surface">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-6 px-5 py-2.5"
          data-testid={item.testId}
          data-activated={item.activated || undefined}
        >
          <span
            className={cn(
              "font-mono text-[10px] tracking-[0.25em] uppercase",
              item.activated ? "text-accent" : "text-dim",
            )}
          >
            {item.label}
          </span>
          <span
            className={cn(
              "font-mono text-[14px] font-bold tracking-[0.08em] tabular-nums uppercase",
              item.activated ? "text-accent" : "text-fg",
            )}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
