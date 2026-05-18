"use client";

import { ChamferedPanel } from "@/components/chamfered-panel";

export function PublishedEmptyState() {
  return (
    <ChamferedPanel tier="component" size="card" className="w-full">
      <div
        className="px-6 py-8 md:px-8"
        data-testid="published-empty-state"
      >
        <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
          {"// No published posts"}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Posts that have gone live will appear here.
        </p>
      </div>
    </ChamferedPanel>
  );
}
