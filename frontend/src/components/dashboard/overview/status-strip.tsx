"use client";

import { useEffect, useState } from "react";

import {
  getPipelineStatus,
  getSettings,
  type PublishingMode,
} from "@/lib/api";

const POLL_MS = 30_000;

function formatPublishingMode(mode: PublishingMode | null): string {
  if (!mode) return "—";
  return mode === "auto" ? "AUTO" : "APPROVE ONLY";
}

function formatRefreshAge(date: Date | null, now: Date): string {
  if (!date) return "—";
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec} SEC AGO`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} MIN AGO`;
  const hr = Math.floor(min / 60);
  return `${hr} HR${hr === 1 ? "" : "S"} AGO`;
}

export function StatusStrip() {
  const [mode, setMode] = useState<PublishingMode | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const settings = await getSettings();
        if (!cancelled) setMode(settings.publishing_mode);
      } catch {
        // Non-fatal — strip just shows "—" for the mode.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        await getPipelineStatus();
        if (cancelled) return;
        setLastRefreshedAt(new Date());
      } catch {
        // Non-fatal — leave the previous "REFRESHED N SEC AGO" in place.
      }
      timeoutId = setTimeout(poll, POLL_MS);
    };

    void poll();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p
      className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase"
      data-testid="overview-status-strip"
    >
      <span>Mode — {formatPublishingMode(mode)}</span>
      <span className="px-3 text-dim" aria-hidden>
        ·
      </span>
      <span>Refreshed {formatRefreshAge(lastRefreshedAt, now)}</span>
    </p>
  );
}
