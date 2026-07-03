import type { ReactNode } from "react";

import { BottomNav } from "@/components/public/bottom-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { buildTickerItems, Ticker } from "@/components/public/ticker";
import { Wordmark } from "@/components/public/wordmark";
import { listPublicPosts } from "@/lib/public-api";

import "./public-theme.css";

/**
 * The stage frame — the shared shell for every public page.
 *
 * A 3px gray frame insets the whole view; a masthead (fit-to-width wordmark +
 * scrolling ticker) sits at the top. A faint scanline textures the whole
 * stage, and a fixed bottom nav floats over it.
 *
 * Scroll model is a media-query split (`.tg-stage*` in public-theme.css):
 * desktop keeps the handoff's locked-viewport stage (100dvh, internal scroll —
 * the design's signature); mobile (≤768px) uses natural document scroll so the
 * URL bar auto-hides, momentum feels native, and anchors / find-in-page work.
 */
export default async function PublicLayout({ children }: { children: ReactNode }) {
  // Ticker headlines come from real recent dispatches (never fabricated
  // claims), interleaved with brand taglines. Falls back to taglines if the
  // backend is unreachable.
  let titles: string[] = [];
  try {
    const { items } = await listPublicPosts({ limit: 8 });
    titles = items.map((p) => p.title.toUpperCase());
  } catch {
    titles = [];
  }
  const tickerItems = buildTickerItems(titles);

  return (
    <div className="tg-surface tg-stage">
      <div className="tg-frame tg-stage-frame">
        <div className="tg-scanline" />

        {/* Masthead: wordmark + ticker (pinned on desktop, in-flow on mobile) */}
        <header style={{ background: "var(--tg-bg)", flexShrink: 0 }}>
          <div className="tg-masthead-brand" style={{ padding: "20px 24px 24px" }}>
            <Wordmark />
          </div>
          <Ticker items={tickerItems} />
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
