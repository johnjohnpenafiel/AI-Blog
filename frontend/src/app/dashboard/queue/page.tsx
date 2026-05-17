import { QueueClient } from "@/components/dashboard/queue/queue-client";

export default function QueuePage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
          {"// 02 — Queue"}
        </p>
        <h1 className="font-display text-[28px] font-bold tracking-[0.02em] text-fg">
          Review Queue
        </h1>
      </header>

      <QueueClient />
    </div>
  );
}
