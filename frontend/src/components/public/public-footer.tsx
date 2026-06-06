import { LogoMark } from "./logo-mark";

/**
 * Inner footer line — the last band inside the scroll region on every public
 * page. LogoMark in the gutter, copyright + the brand thesis (sand) in the
 * content column.
 */
export function PublicFooter() {
  return (
    <div
      data-testid="public-footer"
      style={{
        borderTop: "1px solid var(--tg-frame)",
        display: "grid",
        gridTemplateColumns: "var(--tg-gutter) 1fr",
      }}
    >
      <div style={{ paddingLeft: 24, paddingTop: 22 }}>
        <LogoMark size={30} />
      </div>
      <div
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
