"use client";

import { useState } from "react";

import { ChamferedPanel } from "@/components/chamfered-panel";

interface ShareBarProps {
  title: string;
  slug: string;
}

function buildShareUrl(platform: "x" | "linkedin", postUrl: string, title: string): string {
  const encoded = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(title);
  if (platform === "x") {
    return `https://x.com/intent/tweet?url=${encoded}&text=${encodedTitle}`;
  }
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
}

export function ShareBar({ title, slug }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const postUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/blog/${slug}`
      : `/blog/${slug}`;

  function handleCopy() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/blog/${slug}`
        : `/blog/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
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
          <a
            href={buildShareUrl("x", postUrl, title)}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-5 py-2.5 font-mono text-[10px] tracking-[0.25em] text-accent uppercase transition-colors hover:text-[var(--accent-dim)]"
            aria-label="Share on X"
          >
            X
          </a>
        </ChamferedPanel>

        <ChamferedPanel
          tier="component"
          size="button"
          cut="dual"
          background="transparent"
          perimeterStroke="var(--accent)"
        >
          <a
            href={buildShareUrl("linkedin", postUrl, title)}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-5 py-2.5 font-mono text-[10px] tracking-[0.25em] text-accent uppercase transition-colors hover:text-[var(--accent-dim)]"
            aria-label="Share on LinkedIn"
          >
            LinkedIn
          </a>
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
