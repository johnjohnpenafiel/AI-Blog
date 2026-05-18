import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { QueueClient } from "@/components/dashboard/queue/queue-client";

export default function QueuePage() {
  return (
    <DashboardPageShell section="// 02 — Queue" title="Review Queue">
      <QueueClient />
    </DashboardPageShell>
  );
}
