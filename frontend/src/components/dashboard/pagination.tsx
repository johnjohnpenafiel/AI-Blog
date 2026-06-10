"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
  /** Current page, 1-indexed. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Disable controls (e.g. while a page is loading). */
  disabled?: boolean;
}

/**
 * Compact page-number control in the dashboard's sharp/mono language. Renders
 * nothing for a single page. Windows the numbers with ellipses past 7 pages
 * (always shows first, last, and current ± 1).
 */
function pageItems(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const wanted = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...wanted]
    .filter((n) => n >= 1 && n <= pageCount)
    .sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) out.push("gap");
    out.push(n);
    prev = n;
  }
  return out;
}

const CHIP =
  "flex h-8 min-w-8 items-center justify-center border px-2 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors disabled:pointer-events-none disabled:opacity-40";
const CHIP_IDLE = "border-border text-muted hover:border-accent hover:text-fg";

export function Pagination({
  page,
  pageCount,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-1.5"
      data-testid="pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Previous page"
        className={cn(CHIP, CHIP_IDLE)}
      >
        ←
      </button>

      {pageItems(page, pageCount).map((item, i) =>
        item === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-1 font-mono text-[11px] text-dim"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            disabled={disabled}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              CHIP,
              item === page
                ? "border-accent bg-accent text-[var(--bg)]"
                : CHIP_IDLE,
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= pageCount}
        aria-label="Next page"
        className={cn(CHIP, CHIP_IDLE)}
      >
        →
      </button>
    </nav>
  );
}
