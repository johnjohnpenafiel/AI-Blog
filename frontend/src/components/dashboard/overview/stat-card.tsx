import type { ReactNode } from "react";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  valueClassName?: string;
  subLine?: ReactNode;
  activated?: boolean;
  testId?: string;
}

export function StatCard({
  label,
  value,
  valueClassName,
  subLine,
  activated = false,
  testId,
}: StatCardProps) {
  return (
    <ChamferedPanel tier="component" size="card" className="w-full">
      <div
        className="relative flex h-full flex-col gap-3 px-5 py-5"
        data-testid={testId}
        data-activated={activated || undefined}
      >
        {activated && (
          <span
            aria-hidden
            className="absolute bottom-0 left-0 w-[3px]"
            style={{
              top: "16px",
              backgroundColor: "var(--accent)",
            }}
          />
        )}
        <p
          className={cn(
            "font-mono text-[10px] tracking-[0.25em] uppercase",
            activated ? "text-accent" : "text-dim",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "font-sans leading-none tracking-tight",
            valueClassName ?? "text-[44px] font-black",
            activated ? "text-accent" : "text-fg",
          )}
        >
          {value}
        </p>
        {subLine && (
          <div className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
            {subLine}
          </div>
        )}
      </div>
    </ChamferedPanel>
  );
}
