import { OverviewClient } from "@/components/dashboard/overview/overview-client";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default function DashboardPage() {
  return (
    <DashboardPageShell section="// 01 — Overview" title="Pipeline Overview">
      <OverviewClient />
    </DashboardPageShell>
  );
}
