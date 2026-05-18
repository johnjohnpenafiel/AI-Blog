import { PublishedClient } from "@/components/dashboard/published/published-client";

export default function PublishedPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
          {"// 04 — Published"}
        </p>
        <h1 className="font-display text-[28px] font-bold tracking-[0.02em] text-fg">
          Published Posts
        </h1>
      </header>

      <PublishedClient />
    </div>
  );
}
