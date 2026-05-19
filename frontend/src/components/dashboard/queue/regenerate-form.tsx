"use client";

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
        <button
          type="button"
          disabled={busy}
          onClick={() => onSubmit(value)}
          className="bg-accent px-4 py-2 font-mono text-[11px] tracking-[0.25em] text-[var(--bg)] uppercase transition-colors hover:bg-[var(--accent-dim)] disabled:opacity-50"
        >
          Submit for regeneration
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase hover:text-fg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
