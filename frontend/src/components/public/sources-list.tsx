"use client";

import { useState } from "react";

import type { PublicPostSource } from "@/lib/public-api";

interface SourcesListProps {
  sources: PublicPostSource[];
}

function formatSourceDate(d: string | null): string {
  if (!d) return "";
  try {
    return new Date(d)
      .toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      .toUpperCase();
  } catch {
    return d;
  }
}

export function SourcesList({ sources }: SourcesListProps) {
  const [open, setOpen] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div data-testid="sources-list" className="mt-8 border-t border-[var(--border-dim)] pt-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] text-muted uppercase transition-colors hover:text-fg"
        aria-expanded={open}
      >
        <span>Sources [{sources.length}]</span>
        <span aria-hidden>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <ul className="mt-4 space-y-3">
          {sources.map((src, i) => (
            <li key={i} className="flex flex-col gap-0.5">
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] tracking-[0.1em] text-accent underline underline-offset-2 hover:text-[var(--accent-dim)] transition-colors"
              >
                {src.title}
              </a>
              <span className="font-mono text-[10px] tracking-[0.15em] text-muted uppercase">
                {src.publisher}
                {src.published_date && (
                  <> · {formatSourceDate(src.published_date)}</>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
