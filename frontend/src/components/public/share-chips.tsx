"use client";

import { useState } from "react";

/**
 * Share chips — the design's bare mono tokens (X / in / ↗), not brand logos.
 * X and LinkedIn open share intents; ↗ copies the canonical URL and flashes a
 * confirmation. Uses the live page URL at click time (no SSR origin guessing).
 */
export function ShareChips({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const openShare = (kind: "x" | "in") => {
    const url = window.location.href;
    const href =
      kind === "x"
        ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        type="button"
        className="tg-share-chip"
        aria-label="Share on X"
        onClick={() => openShare("x")}
      >
        X
      </button>
      <button
        type="button"
        className="tg-share-chip"
        aria-label="Share on LinkedIn"
        onClick={() => openShare("in")}
      >
        in
      </button>
      <button
        type="button"
        className="tg-share-chip"
        aria-label="Copy link"
        onClick={copyLink}
        style={copied ? { color: "var(--tg-ink-black)", background: "var(--tg-sand)", borderColor: "var(--tg-sand)" } : undefined}
      >
        {copied ? "✓" : "↗"}
      </button>
    </div>
  );
}
