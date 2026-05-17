"use client";

import { useState } from "react";

import { ChamferedPanel } from "@/components/chamfered-panel";

interface AcceptModalProps {
  open: boolean;
  busy?: boolean;
  onConfirm: (scheduledAtIso: string | undefined) => void;
  onCancel: () => void;
}

type Mode = "choose" | "schedule";

function toIsoUtc(localValue: string): string {
  return new Date(localValue).toISOString();
}

export function AcceptModal({
  open,
  busy = false,
  onConfirm,
  onCancel,
}: AcceptModalProps) {
  const [mode, setMode] = useState<Mode>("choose");
  const [scheduledValue, setScheduledValue] = useState("");

  if (!open) return null;

  const handlePublishNow = () => {
    onConfirm(undefined);
  };

  const handleSchedule = () => {
    if (!scheduledValue) return;
    onConfirm(toIsoUtc(scheduledValue));
  };

  const handleCancel = () => {
    setMode("choose");
    setScheduledValue("");
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Accept post"
      data-testid="accept-modal"
    >
      <ChamferedPanel
        tier="structural"
        size="shell"
        className="w-full max-w-[480px]"
      >
        <div className="flex flex-col gap-5 px-6 py-6">
          <header className="flex flex-col gap-1">
            <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
              {"// Accept Post"}
            </p>
            <h2 className="font-display text-[22px] font-bold tracking-[0.02em] text-fg">
              {mode === "choose"
                ? "Publish now or schedule?"
                : "Schedule for later"}
            </h2>
          </header>

          {mode === "choose" ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={handlePublishNow}
                className="bg-accent px-4 py-3 font-mono text-[11px] tracking-[0.25em] text-[var(--bg)] uppercase transition-colors hover:bg-[var(--accent-dim)] disabled:opacity-50"
                data-testid="accept-publish-now"
              >
                ⚡ Publish now
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setMode("schedule")}
                className="border border-accent px-4 py-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase transition-colors hover:bg-[var(--accent-glow)] disabled:opacity-50"
                data-testid="accept-schedule-open"
              >
                Schedule for later
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase hover:text-fg"
              >
                Back
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
                  Publish at
                </span>
                <input
                  type="datetime-local"
                  value={scheduledValue}
                  onChange={(e) => setScheduledValue(e.target.value)}
                  className="border border-border bg-surface px-3 py-2 font-mono text-sm text-fg focus:border-accent focus:outline-none"
                  data-testid="accept-schedule-input"
                />
              </label>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  disabled={busy || !scheduledValue}
                  onClick={handleSchedule}
                  className="bg-accent px-4 py-3 font-mono text-[11px] tracking-[0.25em] text-[var(--bg)] uppercase transition-colors hover:bg-[var(--accent-dim)] disabled:opacity-50"
                  data-testid="accept-schedule-confirm"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setMode("choose");
                    setScheduledValue("");
                  }}
                  className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase hover:text-fg"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </ChamferedPanel>
    </div>
  );
}
