"use client";

import { useState } from "react";

import { Button } from "@/components/button";
import { usePipelineStatus } from "@/components/dashboard/pipeline-status-context";
import {
  runResultToast,
  useToast,
} from "@/components/dashboard/toast-context";
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
  const { markStarted, markFinished } = usePipelineStatus();
  const toast = useToast();

  async function handleClick() {
    setPending(true);
    setError(null);
    markStarted();
    onStarted?.();
    try {
      const result = await triggerPipelineRun();
      onCompleted?.(result);
      toast(runResultToast(result));
    } catch (e) {
      if (e instanceof PipelineConflictError) {
        setError("Pipeline already running");
      } else {
        setError(e instanceof Error ? e.message : "Failed to trigger pipeline");
      }
    } finally {
      setPending(false);
      markFinished();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="lg"
        disabled={pending}
        onClick={handleClick}
        className={cn(
          "self-start",
          pending && "cursor-wait bg-[var(--accent-dim)] disabled:opacity-90",
        )}
        data-testid="overview-trigger-pipeline"
      >
        {pending ? "Running…" : "Trigger Pipeline"}
      </Button>
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
