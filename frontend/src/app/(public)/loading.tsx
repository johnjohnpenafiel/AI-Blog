/**
 * Route-transition fallback for the public surface. The page itself
 * SSR-fetches and blocks on initial render, so this only flashes during
 * client-side navigations from another route. Themed to the stage (gutter
 * marker + mono kicker + skeleton bars on the card surface).
 */
export default function PublicLoading() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "var(--tg-gutter) 1fr",
        minHeight: "60vh",
      }}
    >
      <div style={{ paddingLeft: 24, paddingTop: 44 }}>
        <span
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "var(--tg-faint)",
          }}
        >
          (··)
        </span>
      </div>
      <div style={{ padding: "44px var(--tg-content-pad) 48px 0" }}>
        <span
          className="tg-kicker tg-pulse"
          style={{ display: "inline-block" }}
        >
          {"// Loading dispatch"}
        </span>
        <div
          style={{ marginTop: 28, height: 56, maxWidth: 640, background: "var(--tg-card)" }}
        />
        <div
          style={{ marginTop: 16, height: 22, maxWidth: 460, background: "var(--tg-card)" }}
        />
        <div
          style={{ marginTop: 36, height: 180, background: "var(--tg-card)" }}
        />
      </div>
    </div>
  );
}
