"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChamferedPanel } from "@/components/chamfered-panel";
import { cn } from "@/lib/utils";

import { PipelineStatusDot } from "./pipeline-status-dot";
import { useQueueCount } from "./queue-count-context";

interface NavItem {
  label: string;
  href: string;
  badgeCount?: number;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard" },
  { label: "Queue", href: "/dashboard/queue" },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count: queueCount } = useQueueCount();

  const navItems: NavItem[] = BASE_NAV_ITEMS.map((item) =>
    item.href === "/dashboard/queue"
      ? { ...item, badgeCount: queueCount ?? undefined }
      : item,
  );

  // Auto-close when viewport grows past the breakpoint (covers the
  // edge case where the user resizes with the drawer still open).
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const handleChange = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // ESC closes the drawer
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Lock page scroll while drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile-only hamburger trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        className="fixed top-3 left-3 z-40 flex items-center gap-2 border border-border bg-structural px-3 py-2 font-mono text-[10px] tracking-[0.25em] text-fg uppercase md:hidden"
      >
        <span aria-hidden className="text-[14px] leading-none">≡</span>
        <span>Menu</span>
      </button>

      {/* Backdrop — covers the page behind the drawer on mobile */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/70 transition-opacity duration-200 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Sidebar — fixed slide-in drawer on mobile, static column on desktop */}
      <div
        className={cn(
          "fixed inset-y-3 left-3 z-50 transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-[120%]",
          "md:static md:translate-x-0 md:transition-none",
        )}
      >
        <ChamferedPanel
          tier="structural"
          size="sidebar"
          cut="left"
          chamferStroke="var(--accent-structural)"
          className="h-[calc(100vh-1.5rem)] w-[280px] md:w-[260px]"
        >
          <nav
            aria-label="Dashboard"
            className="flex h-full flex-col px-5 pt-12 pb-12"
          >
            <div className="mb-4 flex items-start justify-end md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="font-mono text-[14px] leading-none text-dim hover:text-fg"
              >
                ✕
              </button>
            </div>

            {/* Wordmark — the admin surface's lockup. */}
            <div className="mb-10 px-1 md:px-3">
              <p className="font-mono text-[14px] leading-tight font-bold tracking-[0.12em] text-fg uppercase">
                The Garage AI
              </p>
              <p className="mt-1.5 font-mono text-[9px] tracking-[0.45em] text-dim uppercase">
                Admin
              </p>
            </div>

            <ul className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between border-l-2 py-2.5 pl-5 pr-3 font-mono text-[11px] tracking-[0.25em] uppercase transition-colors",
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

            <div className="mt-auto flex flex-col gap-3 border-t border-border-dim px-1 pt-5 md:px-3">
              <PipelineStatusDot />
            </div>
          </nav>
        </ChamferedPanel>
      </div>
    </>
  );
}
