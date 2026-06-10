"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { PipelineRunResult } from "@/lib/api";

export type ToastTone = "success" | "info" | "warning" | "error";

export interface ToastInput {
  tone?: ToastTone;
  /** Short headline, shown uppercase. */
  title: string;
  /** Optional secondary line (e.g. slug or reason). */
  detail?: string;
  /** Auto-dismiss after this many ms (default 5000). */
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastInput, "title">> {
  id: number;
  tone: ToastTone;
  detail?: string;
}

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

const TONE: Record<ToastTone, { color: string; icon: string }> = {
  success: { color: "var(--success)", icon: "✓" },
  info: { color: "var(--accent)", icon: "→" },
  warning: { color: "var(--warning)", icon: "!" },
  error: { color: "var(--destructive)", icon: "✕" },
};

/**
 * Lightweight toast system in the dashboard's sharp/mono language (no library).
 * Toasts stack bottom-right, carry a tone-colored left bar + icon, and
 * auto-dismiss.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      idRef.current += 1;
      const id = idRef.current;
      setItems((prev) => [
        ...prev,
        {
          id,
          tone: input.tone ?? "info",
          title: input.title,
          detail: input.detail,
        },
      ]);
      setTimeout(() => dismiss(id), input.duration ?? 5000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        {items.map((t) => {
          const tone = TONE[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              data-testid="toast"
              className="pointer-events-auto flex items-start gap-3 border border-border bg-surface px-4 py-3"
              style={{
                borderLeftColor: tone.color,
                borderLeftWidth: 3,
                animation: "toast-in 180ms ease-out",
              }}
            >
              <span
                aria-hidden
                className="mt-px font-mono text-[13px] leading-none"
                style={{ color: tone.color }}
              >
                {tone.icon}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <p
                  className="font-mono text-[11px] tracking-[0.2em] uppercase"
                  style={{ color: tone.color }}
                >
                  {t.title}
                </p>
                {t.detail && (
                  <p className="truncate font-mono text-[10px] tracking-[0.1em] text-muted">
                    {t.detail}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="ml-auto font-mono text-[12px] leading-none text-dim transition-colors hover:text-fg"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): (t: ToastInput) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

/** Map a pipeline run outcome to its toast — shared by every trigger point. */
export function runResultToast(result: PipelineRunResult): ToastInput {
  if (result.skipped) {
    return { tone: "warning", title: "Run skipped", detail: result.reason };
  }
  const published = result.status === "published";
  return {
    tone: "success",
    title: published ? "Post published" : "Post created",
    detail: published ? result.slug : "Sent to the review queue",
  };
}
