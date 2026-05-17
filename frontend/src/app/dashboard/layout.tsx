import type { ReactNode } from "react";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col gap-3 p-3 md:flex-row">
      <Sidebar />
      <ChamferedPanel
        tier="structural"
        size="shell"
        className="min-h-[calc(100vh-1.5rem)] flex-1"
      >
        <div className="h-full overflow-y-auto px-8 py-8">{children}</div>
      </ChamferedPanel>
    </div>
  );
}
