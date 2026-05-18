import type { ReactNode } from "react";

interface DashboardPageShellProps {
  section: string;
  title: string;
  children: ReactNode;
}

export function DashboardPageShell({
  section,
  title,
  children,
}: DashboardPageShellProps) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-2 px-5 pt-20 pb-6 md:px-8 md:pt-8">
        <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
          {section}
        </p>
        <h1 className="font-display text-[28px] font-bold tracking-[0.02em] text-fg">
          {title}
        </h1>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 md:px-8">
        {children}
      </div>
    </div>
  );
}
