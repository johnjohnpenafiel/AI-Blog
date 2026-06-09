import Link from "next/link";

import { LogoMark } from "./logo-mark";

/**
 * Fixed bottom nav floating over the stage — a boxed LogoMark (→ home) at left,
 * mono nav links at right, both on a blurred near-black panel.
 *
 * Deviation from the handoff (which showed Home / Blogs / Subscribe): the index
 * *is* the blog, so "Blogs" was redundant, and Subscribe is omitted until the
 * newsletter flow is built (Phase 4) — re-add it then. Wired to our real
 * routes: Home, About.
 */
export function BottomNav() {
  const panel: React.CSSProperties = {
    pointerEvents: "auto",
    display: "flex",
    alignItems: "center",
    background: "rgba(10,10,10,0.74)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid var(--tg-frame)",
  };
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px clamp(20px, 3vw, 44px)",
        pointerEvents: "none",
      }}
    >
      <div style={{ ...panel, gap: 10, padding: "8px 12px" }}>
        <Link href="/" aria-label="Home">
          <LogoMark size={24} />
        </Link>
      </div>
      <div style={{ ...panel, gap: 28, padding: "12px 22px" }}>
        <Link href="/" className="tg-nav-link">
          Home
        </Link>
        <Link href="/about" className="tg-nav-link">
          About
        </Link>
      </div>
    </div>
  );
}
