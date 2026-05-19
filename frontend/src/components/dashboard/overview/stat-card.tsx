import type { ReactNode } from "react";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  valueClassName?: string;
  subLine?: ReactNode;
  footer?: ReactNode;
  activated?: boolean;
  testId?: string;
}

export function StatCard({
  label,
  value,
  valueClassName,
  subLine,
  footer,
  activated = false,
  testId,
}: StatCardProps) {
  return (
    <ChamferedPanel
      tier="component"
      size="card"
      className="w-full"
      perimeterWidth={1.5}
      chamferWidth={activated ? 3 : 1.5}
    >
      <div
        className="relative flex h-full flex-col px-7 py-8"
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
            "shrink-0 font-mono text-[10px] tracking-[0.25em] uppercase",
            activated ? "text-accent" : "text-dim",
          )}
        >
          {label}
        </p>
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <div className="flex h-[76px] w-full items-center justify-center">
            <p
              className={cn(
                "text-center font-sans leading-none tracking-tight",
                valueClassName ?? "font-display text-[72px] font-bold",
                activated ? "text-accent" : "text-[#bbbbbb]",
              )}
            >
              {value}
            </p>
          </div>
          {(subLine ?? footer) && (
            <div className="flex flex-col gap-1 text-center">
              {subLine && (
                <div
                  className={cn(
                    "font-mono text-[10px] tracking-[0.25em] uppercase",
                    activated ? "text-accent" : "text-muted",
                  )}
                >
                  {subLine}
                </div>
              )}
              {footer && (
                <div className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
                  {footer}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ChamferedPanel>
  );
}
