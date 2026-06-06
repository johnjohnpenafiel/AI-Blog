"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

import { ChamferedPanel } from "@/components/chamfered-panel";
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
    try {
      const result = await triggerPipelineRun();
      setRunResult(result);
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
      {/* Section 1: Publishing Mode */}
      <ChamferedPanel tier="component" size="card" className="w-full">
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
      </ChamferedPanel>

      {/* Section 2: Schedule (read-only) */}
      <ChamferedPanel tier="component" size="card" className="w-full">
        <div className="flex flex-col gap-3 px-5 py-5">
          <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
            Pipeline Schedule
          </p>
          <p className="font-display text-[22px] font-semibold tracking-[0.02em] text-fg">
            MON · THU · FRI AT 8:00 AM
          </p>
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
            Cadence fixed in code — not configurable here.
          </p>
        </div>
      </ChamferedPanel>

      {/* Section 3: Manual Controls */}
      <ChamferedPanel tier="component" size="card" className="w-full">
        <div className="flex flex-col gap-4 px-5 py-5">
          <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
            Manual Controls
          </p>
          <ChamferedPanel
            tier="component"
            size="button"
            cut="dual"
            background={runPending ? "var(--accent-dim)" : "var(--accent)"}
            perimeterStroke="var(--accent)"
            className="self-start"
          >
            <button
              type="button"
              disabled={runPending}
              onClick={handleTriggerRun}
              className={cn(
                "block px-5 py-3 font-mono text-[11px] tracking-[0.25em] text-[var(--bg)] uppercase transition-opacity",
                runPending && "cursor-wait opacity-80",
              )}
              data-testid="trigger-pipeline-run"
            >
              {runPending ? "Running…" : "Trigger Manual Run"}
            </button>
          </ChamferedPanel>

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
      </ChamferedPanel>

      {/* Section 4: Session */}
      <ChamferedPanel tier="component" size="card" className="w-full">
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
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="self-start font-mono text-[10px] tracking-[0.25em] text-dim uppercase hover:text-fg"
            data-testid="logout-button"
          >
            Logout
          </button>
        </div>
      </ChamferedPanel>
    </div>
  );
}
