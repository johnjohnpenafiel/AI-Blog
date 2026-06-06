import Link from "next/link";

import { LogoMark } from "./logo-mark";

/**
 * Fixed bottom nav floating over the stage — a boxed LogoMark (→ home) at left,
 * mono nav links at right, both on a blurred near-black panel.
 *
 * Deviation from the handoff (which showed Home / Blogs / Subscribe): the index
 * *is* the blog, so "Blogs" was redundant. Wired to our real routes — Home,
 * About — plus Subscribe, which has no destination yet (Phase 4 newsletter).
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
        {/* Subscribe flow not built yet (Phase 4). Rendered but inert + dimmed
            so the gap is visible; tracked in REVIEW.md → Needs content. */}
        <span
          className="tg-nav-link"
          aria-disabled="true"
          title="Subscribe — not yet wired (Phase 4 newsletter)"
          style={{ opacity: 0.45, cursor: "not-allowed" }}
        >
          Subscribe
        </span>
      </div>
    </div>
  );
}
