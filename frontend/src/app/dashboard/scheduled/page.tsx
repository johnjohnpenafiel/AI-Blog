import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { ScheduledClient } from "@/components/dashboard/scheduled/scheduled-client";

export default function ScheduledPage() {
  return (
    <DashboardPageShell section="// 03 — Scheduled" title="Scheduled Posts">
      <ScheduledClient />
    </DashboardPageShell>
  );
}
