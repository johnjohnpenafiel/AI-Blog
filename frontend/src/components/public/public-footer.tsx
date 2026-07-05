/**
 * Inner footer line — the last band inside the scroll region on every public
 * page. Copyright + the brand thesis (sand) run full-width; the brand mark
 * itself lives in the persistent bottom nav.
 */
export function PublicFooter() {
  return (
    <div
      data-testid="public-footer"
      className="tg-band"
      style={{ borderTop: "1px solid var(--tg-frame)" }}
    >
      <div
        className="tg-band-content"
        style={{
          padding: "22px var(--tg-content-pad) 24px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontSize: 10,
            color: "var(--tg-faint)",
            letterSpacing: "0.1em",
          }}
        >
          © 2026 THE GARAGE AI
        </span>
        <span
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontSize: 10,
            color: "var(--tg-sand)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          AI as the dealership operating system
        </span>
      </div>
    </div>
  );
}
