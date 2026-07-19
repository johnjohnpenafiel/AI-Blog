import Link from "next/link";

/**
 * Fixed bottom nav floating over the stage — mono nav links on a blurred
 * near-black panel, right-aligned (per the v5 canvas, which dropped the old
 * boxed-LogoMark panel). "News" is the homepage: the index IS the news.
 * Subscribe returns when the newsletter flow ships (Phase 4).
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
        justifyContent: "flex-end",
        alignItems: "center",
        padding:
          "16px clamp(20px, 3vw, 44px) calc(16px + env(safe-area-inset-bottom, 0px))",
        pointerEvents: "none",
      }}
    >
      <div style={{ ...panel, gap: 28, padding: "12px 22px" }}>
        <Link href="/" className="tg-nav-link">
          News
        </Link>
        <Link href="/about" className="tg-nav-link">
          About
        </Link>
      </div>
    </div>
  );
}
