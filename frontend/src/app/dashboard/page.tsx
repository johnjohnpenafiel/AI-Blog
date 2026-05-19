import { OverviewClient } from "@/components/dashboard/overview/overview-client";
import { StatusStrip } from "@/components/dashboard/overview/status-strip";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default function DashboardPage() {
  return (
    <DashboardPageShell
      section="// PIPELINE"
      title="Overview"
      subTitle={<StatusStrip />}
    >
      <OverviewClient />
    </DashboardPageShell>
  );
}
