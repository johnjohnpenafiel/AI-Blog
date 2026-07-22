"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const LINKS = [
  { href: "/", label: "Blog" },
  { href: "/about", label: "About" },
];

/**
 * Mobile masthead (≤768px) — the NYT pattern recomposed for the stage:
 * burger on the left, the wordmark centered at a fixed size (the fit-to-width
 * stage piece stays desktop-only), and a full-screen menu overlay of stacked
 * editorial links with hairline dividers. No search, no profile — only what
 * the site actually has.
 */
export function MobileMasthead() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when navigation actually happens (covers back/forward too) —
  // state adjusted during render, not in an effect, per the React idiom.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  // The overlay owns the screen — freeze the document scroll behind it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="tg-masthead-brand tg-masthead-mobile">
        <button
          type="button"
          className="tg-burger"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <svg width="16" height="11" viewBox="0 0 16 11" aria-hidden="true">
            <rect x="0" y="0" width="16" height="1.5" fill="currentColor" />
            <rect x="0" y="4.75" width="16" height="1.5" fill="currentColor" />
            <rect x="0" y="9.5" width="16" height="1.5" fill="currentColor" />
          </svg>
        </button>
        <Link href="/" className="tg-mobile-wordmark">
          THE GARAGE AI
        </Link>
        {/* invisible mirror of the burger so the wordmark centers truly */}
        <span className="tg-burger tg-burger-ghost" aria-hidden="true" />
      </div>

      {/* Portaled to <body>: the header sits inside the frame's stacking
          context (z-index 1), which would trap the overlay under the page
          content. The tg-surface class comes along so the --tg-* tokens
          still resolve outside the stage subtree. */}
      {open &&
        createPortal(
          <div
            className="tg-surface tg-mobnav"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <button
              type="button"
              className="tg-mobnav-close"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <nav className="tg-mobnav-list">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="tg-mobnav-link"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
