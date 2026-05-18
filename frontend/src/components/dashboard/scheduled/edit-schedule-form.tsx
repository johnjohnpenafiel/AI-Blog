"use client";

import { useState } from "react";

interface EditScheduleFormProps {
  initialIso: string | null;
  busy?: boolean;
  onSave: (scheduledAtIso: string) => void;
  onCancel: () => void;
}

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

function toIsoUtc(localValue: string): string {
  return new Date(localValue).toISOString();
}

export function EditScheduleForm({
  initialIso,
  busy = false,
  onSave,
  onCancel,
}: EditScheduleFormProps) {
  const [value, setValue] = useState(() => toLocalInputValue(initialIso));

  const handleSave = () => {
    if (!value) return;
    onSave(toIsoUtc(value));
  };

  return (
    <div
      className="mt-4 flex flex-col gap-3 border-t border-border-dim pt-4"
      data-testid="edit-schedule-form"
    >
      <label className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
          Publish at
        </span>
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={busy}
          className="border border-border bg-surface px-3 py-2 font-mono text-sm text-fg focus:border-accent focus:outline-none disabled:opacity-50"
          data-testid="edit-schedule-input"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || !value}
          onClick={handleSave}
          className="bg-accent px-4 py-2 font-mono text-[11px] tracking-[0.25em] text-[var(--bg)] uppercase transition-colors hover:bg-[var(--accent-dim)] disabled:opacity-50"
          data-testid="edit-schedule-save"
        >
          Save
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase hover:text-fg"
          data-testid="edit-schedule-cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
