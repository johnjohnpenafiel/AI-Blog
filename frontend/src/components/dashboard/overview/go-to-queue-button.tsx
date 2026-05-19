import Link from "next/link";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { cn } from "@/lib/utils";

interface GoToQueueButtonProps {
  dim?: boolean;
}

export function GoToQueueButton({ dim = false }: GoToQueueButtonProps) {
  return (
    <ChamferedPanel
      tier="component"
      size="button"
      cut="dual"
      background="transparent"
      perimeterStroke="var(--accent)"
      className={cn("self-start", dim && "opacity-50")}
    >
      <Link
        href="/dashboard/queue"
        className={cn(
          "block px-5 py-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase",
          dim
            ? "cursor-default"
            : "transition-colors hover:text-[var(--accent-dim)]",
        )}
        data-testid="overview-go-to-queue"
      >
        Go to Queue →
      </Link>
    </ChamferedPanel>
  );
}
