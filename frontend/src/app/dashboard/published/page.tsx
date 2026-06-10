import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { PublishedClient } from "@/components/dashboard/published/published-client";

export default function PublishedPage() {
  return (
    <DashboardPageShell title="Published Posts">
      <PublishedClient />
    </DashboardPageShell>
  );
}
