import type { ReactNode } from "react";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { QueueCountProvider } from "@/components/dashboard/queue-count-context";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <QueueCountProvider>
      <div className="flex h-screen flex-row gap-3 overflow-hidden p-3">
        <Sidebar />
        <ChamferedPanel
          tier="structural"
          size="shell"
          cut="right"
          chamferStroke="var(--accent-structural)"
          className="h-[calc(100vh-1.5rem)] flex-1 overflow-hidden"
        >
          {children}
        </ChamferedPanel>
      </div>
    </QueueCountProvider>
  );
}
