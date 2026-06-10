"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getPipelineStatus } from "@/lib/api";

/**
 * Shared pipeline status, so the sidebar dot and the overview reflect a run the
 * instant it's triggered — instead of waiting for an independent poll to catch
 * up (the old nav-dot lag).
 *
 * States: `idle` → `preparing` (optimistic, set the moment Trigger is pressed,
 * before the backend reports back) → `running` (backend-confirmed) → `idle`.
 * The backend only knows idle/running; `preparing` is a frontend bridge.
 */
type PipelineState = "idle" | "preparing" | "running";

interface PipelineStatusContextValue {
  state: PipelineState;
  lastRunAt: string | null;
  nextRunAt: string | null;
  /** Optimistically enter `preparing` (call on Trigger click). */
  markStarted: () => void;
  /** A triggered run resolved — re-sync from the backend. */
  markFinished: () => void;
}

const PipelineStatusContext =
  createContext<PipelineStatusContextValue | null>(null);

const IDLE_POLL_MS = 30_000;
const ACTIVE_POLL_MS = 3_000;

export function PipelineStatusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PipelineState>("idle");
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [nextRunAt, setNextRunAt] = useState<string | null>(null);

  // Latest state, read by the polling loop to pick its cadence.
  const stateRef = useRef<PipelineState>("idle");
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Populated by the polling effect — "poll now and restart the cadence".
  const kickRef = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const data = await getPipelineStatus();
        if (cancelled) return;
        setLastRunAt(data.last_run_at);
        setNextRunAt(data.next_run_at);
        if (data.state === "running") {
          setState("running");
        } else {
          // Backend idle: keep an optimistic `preparing` (a stale poll mustn't
          // clobber the just-pressed state — markFinished clears it for real).
          setState((prev) => (prev === "preparing" ? "preparing" : "idle"));
        }
      } catch {
        // Hold the last known state on transient errors.
      }
    }

    async function loop() {
      await poll();
      if (cancelled) return;
      const delay = stateRef.current === "idle" ? IDLE_POLL_MS : ACTIVE_POLL_MS;
      timeoutId = setTimeout(loop, delay);
    }

    function kick() {
      if (timeoutId) clearTimeout(timeoutId);
      void loop();
    }
    kickRef.current = kick;

    void loop();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const markStarted = useCallback(() => {
    stateRef.current = "preparing";
    setState("preparing");
    // Restart polling on the fast cadence so `running` is confirmed quickly.
    kickRef.current();
  }, []);

  const markFinished = useCallback(() => {
    stateRef.current = "idle";
    setState("idle");
    kickRef.current();
  }, []);

  return (
    <PipelineStatusContext.Provider
      value={{ state, lastRunAt, nextRunAt, markStarted, markFinished }}
    >
      {children}
    </PipelineStatusContext.Provider>
  );
}

export function usePipelineStatus(): PipelineStatusContextValue {
  const ctx = useContext(PipelineStatusContext);
  if (!ctx) {
    throw new Error(
      "usePipelineStatus must be used inside <PipelineStatusProvider>",
    );
  }
  return ctx;
}
