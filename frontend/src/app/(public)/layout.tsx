import type { ReactNode } from "react";

import { BottomNav } from "@/components/public/bottom-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { Wordmark } from "@/components/public/wordmark";

import "./public-theme.css";

/**
 * The stage frame — the shared shell for every public page.
 *
 * A 3px gray frame insets the whole view; a masthead (fit-to-width wordmark)
 * sits at the top. A faint scanline textures the whole stage, and a fixed
 * bottom nav floats over it.
 *
 * Scroll model is a media-query split (`.tg-stage*` in public-theme.css):
 * desktop keeps the handoff's locked-viewport stage (100dvh, internal scroll —
 * the design's signature); mobile (≤768px) uses natural document scroll so the
 * URL bar auto-hides, momentum feels native, and anchors / find-in-page work.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="tg-surface tg-stage">
      <div className="tg-frame tg-stage-frame">
        <div className="tg-scanline" />

        {/* Masthead: wordmark (pinned on desktop, in-flow on mobile) */}
        <header style={{ background: "var(--tg-bg)", flexShrink: 0 }}>
          <div className="tg-masthead-brand" style={{ padding: "14px 24px" }}>
            <Wordmark />
          </div>
        </header>

        {/* Scroll region — every page's bands render here, then the footer */}
        <div className="tg-stage-scroll">
          {children}
          <PublicFooter />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
