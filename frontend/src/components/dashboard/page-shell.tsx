import type { ReactNode } from "react";

interface DashboardPageShellProps {
  title: string;
  subTitle?: ReactNode;
  children: ReactNode;
}

export function DashboardPageShell({
  title,
  subTitle,
  children,
}: DashboardPageShellProps) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-3 px-8 pt-20 pb-10 md:px-16 md:pt-12">
        <h1 className="font-display text-[40px] font-bold tracking-[0.04em] text-fg uppercase">
          {title}
        </h1>
        {subTitle && <div className="-mt-1">{subTitle}</div>}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-12 md:px-16">
        {children}
      </div>
    </div>
  );
}
