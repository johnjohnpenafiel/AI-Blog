import Link from "next/link";

import { ChamferedPanel } from "@/components/chamfered-panel";

export function GoToQueueButton() {
  return (
    <ChamferedPanel
      tier="component"
      size="button"
      cut="dual"
      background="transparent"
      perimeterStroke="var(--accent)"
      className="self-start"
    >
      <Link
        href="/dashboard/queue"
        className="block px-5 py-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase transition-colors hover:text-[var(--accent-dim)]"
        data-testid="overview-go-to-queue"
      >
        Go to Queue →
      </Link>
    </ChamferedPanel>
  );
}
