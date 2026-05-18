"use client";

import { ChamferedPanel } from "@/components/chamfered-panel";
import type { PublishingMode } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PublishingModeToggleProps {
  value: PublishingMode;
  onChange: (next: PublishingMode) => void;
  disabled?: boolean;
}

const OPTIONS: ReadonlyArray<{ value: PublishingMode; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "approve_only", label: "Approve Only" },
];

export function PublishingModeToggle({
  value,
  onChange,
  disabled,
}: PublishingModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Publishing mode"
      className="grid grid-cols-2 gap-3"
    >
      {OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <ChamferedPanel
            key={option.value}
            tier="component"
            size="button"
            cut="dual"
            background={
              isActive ? "var(--accent)" : "var(--surface)"
            }
            perimeterStroke={
              isActive ? "var(--accent)" : "var(--border)"
            }
          >
            <button
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => {
                if (!isActive && !disabled) onChange(option.value);
              }}
              className={cn(
                "block w-full px-4 py-3 font-mono text-[11px] tracking-[0.25em] uppercase transition-opacity",
                isActive
                  ? "text-[var(--bg)]"
                  : "text-muted hover:text-fg",
                disabled && "cursor-not-allowed opacity-50",
              )}
              data-testid={`publishing-mode-${option.value}`}
            >
              {option.label}
            </button>
          </ChamferedPanel>
        );
      })}
    </div>
  );
}
