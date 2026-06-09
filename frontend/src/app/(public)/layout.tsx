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
 * A 3px gray frame insets the whole view; a fixed masthead (fit-to-width
 * wordmark + scrolling ticker) sits at the top; everything below scrolls inside
 * the frame, clipped by it. A faint scanline textures the whole stage, and a
 * fixed bottom nav floats over it.
 *
 * NOTE (decision to review — see REVIEW.md): this faithfully recreates the
 * handoff's locked-viewport stage (100dvh, internal scroll). It's the design's
 * signature but trades away native page scroll; for SEO/mobile we may later
 * switch to a sticky masthead over natural document scroll. Isolated here so
 * it's a one-file change.
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
    <div
      className="tg-surface"
      style={{ height: "100dvh", overflow: "hidden", position: "relative" }}
    >
      <div
        className="tg-frame"
        style={{
          margin: "var(--tg-frame-pad) var(--tg-frame-pad) 0",
          height: "calc(100dvh - var(--tg-frame-pad))",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div className="tg-scanline" />

        {/* Fixed masthead: wordmark + ticker */}
        <header style={{ background: "var(--tg-bg)", flexShrink: 0 }}>
          <div
            style={{
              padding: "20px 24px 24px",
              borderBottom: "3px solid var(--tg-frame)",
            }}
          >
            <Wordmark />
          </div>
          <Ticker items={tickerItems} />
        </header>

        {/* Scroll region — every page's bands render here, then the footer */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            paddingBottom: 76,
          }}
        >
          {children}
          <PublicFooter />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
