"use client";

import { Button } from "@/components/button";
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
          <Button
            key={option.value}
            variant={isActive ? "primary" : "ghost"}
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => {
              if (!isActive && !disabled) onChange(option.value);
            }}
            className={cn("w-full py-3", !isActive && "bg-surface")}
            data-testid={`publishing-mode-${option.value}`}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
