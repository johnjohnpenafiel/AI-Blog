"use client";

import { Button } from "@/components/button";

interface RegenerateFormProps {
  value: string;
  onChange: (value: string) => void;
  busy?: boolean;
  onSubmit: (feedback: string) => void;
  onCancel: () => void;
}

export function RegenerateForm({
  value,
  onChange,
  busy = false,
  onSubmit,
  onCancel,
}: RegenerateFormProps) {
  return (
    <div
      className="flex flex-col gap-3 border-t border-border-dim pt-4"
      data-testid="regenerate-form"
    >
      <label className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
          Optional: describe what to change
        </span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="e.g. shorter intro, more focus on dealer impact, drop the third example"
          className="border border-border bg-surface px-3 py-2 font-mono text-sm text-fg placeholder:text-dim focus:border-accent focus:outline-none"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button disabled={busy} onClick={() => onSubmit(value)}>
          Submit for regeneration
        </Button>
        <Button variant="link" size="sm" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
