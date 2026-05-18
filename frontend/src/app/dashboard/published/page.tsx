import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { PublishedClient } from "@/components/dashboard/published/published-client";

export default function PublishedPage() {
  return (
    <DashboardPageShell section="// 04 — Published" title="Published Posts">
      <PublishedClient />
    </DashboardPageShell>
  );
}
