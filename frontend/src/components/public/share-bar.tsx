"use client";

import { useState } from "react";

import { ChamferedPanel } from "@/components/chamfered-panel";

interface ShareBarProps {
  title: string;
  slug: string;
}

function openShare(platform: "x" | "linkedin", slug: string, title: string) {
  const url = `${window.location.origin}/blog/${slug}`;
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const shareUrl =
    platform === "x"
      ? `https://x.com/intent/tweet?url=${encoded}&text=${encodedTitle}`
      : `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
  window.open(shareUrl, "_blank", "noopener,noreferrer");
}

export function ShareBar({ title, slug }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(`${window.location.origin}/blog/${slug}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div data-testid="share-bar" className="mt-12 border-t border-[var(--border-dim)] pt-8">
      <p className="mb-4 font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
        Share this post →
      </p>
      <div className="flex flex-wrap gap-3">
        <ChamferedPanel
          tier="component"
          size="button"
          cut="dual"
          background="transparent"
          perimeterStroke="var(--accent)"
        >
          <button
            onClick={() => openShare("x", slug, title)}
            className="block px-5 py-2.5 font-mono text-[10px] tracking-[0.25em] text-accent uppercase transition-colors hover:text-[var(--accent-dim)]"
            aria-label="Share on X"
          >
            X
          </button>
        </ChamferedPanel>

        <ChamferedPanel
          tier="component"
          size="button"
          cut="dual"
          background="transparent"
          perimeterStroke="var(--accent)"
        >
          <button
            onClick={() => openShare("linkedin", slug, title)}
            className="block px-5 py-2.5 font-mono text-[10px] tracking-[0.25em] text-accent uppercase transition-colors hover:text-[var(--accent-dim)]"
            aria-label="Share on LinkedIn"
          >
            LinkedIn
          </button>
        </ChamferedPanel>

        <ChamferedPanel
          tier="component"
          size="button"
          cut="dual"
          background="transparent"
          perimeterStroke="var(--accent)"
        >
          <button
            onClick={handleCopy}
            className="block px-5 py-2.5 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors"
            style={{ color: copied ? "var(--success)" : "var(--accent)" }}
            aria-label="Copy link"
          >
            {copied ? "Copied ✓" : "Copy Link"}
          </button>
        </ChamferedPanel>
      </div>
    </div>
  );
}
