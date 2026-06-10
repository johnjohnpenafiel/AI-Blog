import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { QueueClient } from "@/components/dashboard/queue/queue-client";

export default function QueuePage() {
  return (
    <DashboardPageShell title="Review Queue">
      <QueueClient />
    </DashboardPageShell>
  );
}
