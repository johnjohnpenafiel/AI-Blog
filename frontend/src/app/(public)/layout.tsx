import type { ReactNode } from "react";

import { BottomNav } from "@/components/public/bottom-nav";
import { MastheadFolio } from "@/components/public/masthead-folio";
import { MastheadWelcome } from "@/components/public/masthead-welcome";
import { MobileMasthead } from "@/components/public/mobile-masthead";
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

        {/* Masthead: fit-to-width wordmark on desktop; on mobile a
            burger | centered wordmark bar + full-screen menu overlay */}
        {/* zIndex 2 lifts the header above the scroll region (both default to
            z-index 1 via .tg-frame > *) so the folio tab's zero-height
            overhang paints OVER scrolling content. */}
        <header
          style={{
            background: "var(--tg-bg)",
            flexShrink: 0,
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            className="tg-masthead-brand tg-masthead-desktop"
            style={{ padding: "26px 24px" }}
          >
            {/* Homepage only: the "// Welcome to" eyebrow that rides up with
                the wordmark on the first scroll and vanishes behind the top
                frame line. Null elsewhere. */}
            <MastheadWelcome />
            <Wordmark />
          </div>
          {/* Homepage only: the date TAB hung from the masthead rule —
              pinned with the header (the line must survive scrolling) and
              outside .tg-home's 0.8 zoom (the 3px contour must rasterize
              at true scale). Null elsewhere. */}
          <MastheadFolio />
          <MobileMasthead />
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
