import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default function DashboardPage() {
  return (
    <DashboardPageShell section="// 01 — Overview" title="Pipeline Overview">
      <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
        Stat cards + quick actions ship in the{" "}
        <code className="text-fg">dashboard-overview</code> feature.
      </p>
    </DashboardPageShell>
  );
}
