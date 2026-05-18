import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { SettingsClient } from "@/components/dashboard/settings/settings-client";

export default function SettingsPage() {
  return (
    <DashboardPageShell section="// 05 — Settings" title="Settings">
      <SettingsClient />
    </DashboardPageShell>
  );
}
