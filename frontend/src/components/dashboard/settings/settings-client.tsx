"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/button";
import { usePipelineStatus } from "@/components/dashboard/pipeline-status-context";
import {
  runResultToast,
  useToast,
} from "@/components/dashboard/toast-context";
import {
  PipelineConflictError,
  getSettings,
  triggerPipelineRun,
  updateSettings,
  type PipelineRunResult,
  type PublishingMode,
  type Settings,
} from "@/lib/api";
import { cn } from "@/lib/utils";

import { PublishingModeToggle } from "./publishing-mode-toggle";

type LoadState = "loading" | "ready" | "error";

const MODE_DESCRIPTIONS: Record<PublishingMode, string> = {
  auto: "Posts publish immediately on generation. No review step.",
  approve_only:
    "Posts land in the review queue. Admin must accept before publish.",
};

function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d
      .toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .toUpperCase();
  } catch {
    return iso;
  }
}

export function SettingsClient() {
  const { data: session } = useSession();
  const { markStarted, markFinished } = usePipelineStatus();
  const toast = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modePending, setModePending] = useState(false);
  const [modeError, setModeError] = useState<string | null>(null);

  const [runPending, setRunPending] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<PipelineRunResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getSettings();
        if (cancelled) return;
        setSettings(data);
        setLoadState("ready");
      } catch (e) {
        if (cancelled) return;
        setLoadError(
          e instanceof Error ? e.message : "Failed to load settings",
        );
        setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleModeChange(next: PublishingMode) {
    setModePending(true);
    setModeError(null);
    try {
      const updated = await updateSettings({ publishing_mode: next });
      setSettings(updated);
    } catch (e) {
      setModeError(
        e instanceof Error ? e.message : "Failed to update publishing mode",
      );
    } finally {
      setModePending(false);
    }
  }

  async function handleTriggerRun() {
    setRunPending(true);
    setRunError(null);
    setRunResult(null);
    markStarted();
    try {
      const result = await triggerPipelineRun();
      setRunResult(result);
      toast(runResultToast(result));
      // Refresh settings so LAST RUN / NEXT RUN reflect the new timestamps.
      try {
        const refreshed = await getSettings();
        setSettings(refreshed);
      } catch {
        // Non-fatal: the run succeeded; timestamps will refresh on next load.
      }
    } catch (e) {
      if (e instanceof PipelineConflictError) {
        setRunError("Pipeline already running");
      } else {
        setRunError(
          e instanceof Error ? e.message : "Failed to trigger pipeline",
        );
      }
    } finally {
      setRunPending(false);
      markFinished();
    }
  }

  if (loadState === "loading") {
    return (
      <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
        Loading settings…
      </p>
    );
  }

  if (loadState === "error" || !settings) {
    return (
      <p
        role="alert"
        className="font-mono text-xs tracking-[0.2em] text-destructive uppercase"
      >
        {loadError ?? "Failed to load settings"}
      </p>
    );
  }

  const email = session?.user?.email ?? "—";

  return (
    <div className="flex flex-col gap-5">
      {/* Publishing Mode — plain rectangle (settings aren't posts). */}
      <div className="w-full border border-border bg-surface">
        <div className="flex flex-col gap-4 px-5 py-5">
          <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
            Publishing Mode
          </p>
          <PublishingModeToggle
            value={settings.publishing_mode}
            onChange={handleModeChange}
            disabled={modePending}
          />
          <p className="text-sm leading-relaxed text-muted">
            {MODE_DESCRIPTIONS[settings.publishing_mode]}
          </p>
          {modeError && (
            <p
              role="alert"
              className="font-mono text-[10px] tracking-[0.25em] text-destructive uppercase"
            >
              {modeError}
            </p>
          )}
        </div>
      </div>

      {/* Pipeline — schedule (read-only cadence) + manual controls, tied into
          one card since they're the same concern. */}
      <div className="w-full border border-border bg-surface">
        <div className="flex flex-col gap-4 px-5 py-5">
          <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
            Pipeline
          </p>

          <div className="flex flex-col gap-1">
            <p className="font-display text-[22px] font-semibold tracking-[0.02em] text-fg">
              MON · THU · FRI AT 8:00 AM
            </p>
            <p className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
              Cadence fixed in code — not configurable here.
            </p>
          </div>

          <Button
            size="lg"
            disabled={runPending}
            onClick={handleTriggerRun}
            className={cn(
              "self-start",
              runPending && "cursor-wait bg-[var(--accent-dim)] disabled:opacity-90",
            )}
            data-testid="trigger-pipeline-run"
          >
            {runPending ? "Running…" : "Trigger Manual Run"}
          </Button>

          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
                Last Run
              </dt>
              <dd className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
                {formatTimestamp(settings.last_run_at)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
                Next Run
              </dt>
              <dd className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
                {formatTimestamp(settings.next_run_at)}
              </dd>
            </div>
          </dl>

          {runResult && !runError && (
            <p
              className="font-mono text-[10px] tracking-[0.25em] uppercase"
              style={{
                color: runResult.skipped
                  ? "var(--warning)"
                  : "var(--success)",
              }}
              data-testid="pipeline-run-result"
            >
              {runResult.skipped
                ? `Skipped — ${runResult.reason}`
                : `Published — ${runResult.slug}`}
            </p>
          )}
          {runError && (
            <p
              role="alert"
              className="font-mono text-[10px] tracking-[0.25em] text-destructive uppercase"
            >
              {runError}
            </p>
          )}
        </div>
      </div>

      {/* Session — logout as a plain (neutral) button so it reads as clickable. */}
      <div className="w-full border border-border bg-surface">
        <div className="flex flex-col gap-3 px-5 py-5">
          <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
            Session
          </p>
          <p
            className="font-mono text-sm tracking-[0.1em] text-fg"
            data-testid="session-email"
          >
            {email}
          </p>
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="self-start"
            data-testid="logout-button"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
