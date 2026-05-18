import { SettingsClient } from "@/components/dashboard/settings/settings-client";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
          {"// 05 — Settings"}
        </p>
        <h1 className="font-display text-[28px] font-bold tracking-[0.02em] text-fg">
          Settings
        </h1>
      </header>

      <SettingsClient />
    </div>
  );
}
