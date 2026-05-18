import { ScheduledClient } from "@/components/dashboard/scheduled/scheduled-client";

export default function ScheduledPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
          {"// 03 — Scheduled"}
        </p>
        <h1 className="font-display text-[28px] font-bold tracking-[0.02em] text-fg">
          Scheduled Posts
        </h1>
      </header>

      <ScheduledClient />
    </div>
  );
}
