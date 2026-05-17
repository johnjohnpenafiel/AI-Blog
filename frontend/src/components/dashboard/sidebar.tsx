"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { cn } from "@/lib/utils";

import { PipelineStatusDot } from "./pipeline-status-dot";

interface NavItem {
  label: string;
  href: string;
  badgeCount?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard" },
  { label: "Queue", href: "/dashboard/queue", badgeCount: 0 },
  { label: "Scheduled", href: "/dashboard/scheduled" },
  { label: "Published", href: "/dashboard/published" },
  { label: "Settings", href: "/dashboard/settings" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <ChamferedPanel
      tier="structural"
      size="sidebar"
      className="min-h-[calc(100vh-1.5rem)] w-full md:w-[220px]"
    >
      <nav
        aria-label="Dashboard"
        className="flex h-full flex-col px-5 py-6"
      >
        <Link href="/dashboard" className="mb-10 block">
          <span className="font-display text-[20px] font-bold tracking-[0.02em] text-fg">
            DE<span className="text-accent">LOR</span>EAN
          </span>
          <span className="ml-1 font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
            / Admin
          </span>
        </Link>

        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between border-l-2 py-2 pl-4 pr-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors",
                    active
                      ? "border-l-accent bg-accent-glow text-accent"
                      : "border-l-transparent text-dim hover:text-fg",
                  )}
                >
                  <span>{item.label}</span>
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span className="bg-accent px-1.5 py-0.5 font-mono text-[9px] tracking-[0.1em] text-[var(--bg)]">
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex flex-col gap-3 border-t border-border-dim pt-5">
          <PipelineStatusDot />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-left font-mono text-[10px] tracking-[0.25em] text-dim uppercase hover:text-fg"
          >
            Logout
          </button>
        </div>
      </nav>
    </ChamferedPanel>
  );
}
