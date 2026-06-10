import Link from "next/link";

import { buttonClasses } from "@/components/button";
import { cn } from "@/lib/utils";

interface GoToQueueButtonProps {
  dim?: boolean;
}

export function GoToQueueButton({ dim = false }: GoToQueueButtonProps) {
  return (
    <Link
      href="/dashboard/queue"
      className={buttonClasses(
        "outline",
        "lg",
        cn("self-start", dim && "pointer-events-none opacity-50"),
      )}
      data-testid="overview-go-to-queue"
    >
      Go to Queue →
    </Link>
  );
}
