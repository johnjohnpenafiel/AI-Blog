import type { ReactNode } from "react";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { QueueCountProvider } from "@/components/dashboard/queue-count-context";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <QueueCountProvider>
      <div className="flex min-h-screen flex-row gap-3 p-3">
        <Sidebar />
        <ChamferedPanel
          tier="structural"
          size="shell"
          className="min-h-[calc(100vh-1.5rem)] flex-1"
        >
          <div className="h-full overflow-y-auto px-5 pt-20 pb-8 md:px-8 md:pt-8">
            {children}
          </div>
        </ChamferedPanel>
      </div>
    </QueueCountProvider>
  );
}
