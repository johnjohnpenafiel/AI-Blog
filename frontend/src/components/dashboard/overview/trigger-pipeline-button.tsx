"use client";

import { useState } from "react";

import { ChamferedPanel } from "@/components/chamfered-panel";
import {
  PipelineConflictError,
  triggerPipelineRun,
  type PipelineRunResult,
} from "@/lib/api";
import { cn } from "@/lib/utils";

interface TriggerPipelineButtonProps {
  onCompleted?: (result: PipelineRunResult) => void;
  onStarted?: () => void;
}

export function TriggerPipelineButton({
  onCompleted,
  onStarted,
}: TriggerPipelineButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    onStarted?.();
    try {
      const result = await triggerPipelineRun();
      onCompleted?.(result);
    } catch (e) {
      if (e instanceof PipelineConflictError) {
        setError("Pipeline already running");
      } else {
        setError(e instanceof Error ? e.message : "Failed to trigger pipeline");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <ChamferedPanel
        tier="component"
        size="button"
        cut="dual"
        background={pending ? "var(--accent-dim)" : "var(--accent)"}
        perimeterStroke="var(--accent)"
        className="self-start"
      >
        <button
          type="button"
          disabled={pending}
          onClick={handleClick}
          className={cn(
            "block px-5 py-3 font-mono text-[11px] tracking-[0.25em] text-[var(--bg)] uppercase transition-opacity",
            pending && "cursor-wait opacity-80",
          )}
          data-testid="overview-trigger-pipeline"
        >
          {pending ? "Running…" : "Trigger Pipeline"}
        </button>
      </ChamferedPanel>
      {error && (
        <p
          role="alert"
          className="font-mono text-[10px] tracking-[0.25em] text-destructive uppercase"
        >
          {error}
        </p>
      )}
    </div>
  );
}
