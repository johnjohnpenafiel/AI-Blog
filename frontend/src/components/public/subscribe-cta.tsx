/**
 * Subscribe CTA band — the brand promise. The newsletter flow isn't built yet
 * (Phase 4), so the button is rendered inert + dimmed with a loud
 * ⟨NEEDS CONTENT⟩ marker. Copy corrected to the real cadence (three a week).
 */
export function SubscribeCta() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "var(--tg-gutter) 1fr",
        borderTop: "1px solid var(--tg-frame)",
        marginTop: 44,
        background: "var(--tg-ink-black)",
      }}
    >
      <div style={{ paddingLeft: 24, paddingTop: 40 }}>
        <span
          style={{
            fontFamily: "var(--tg-font-mono)",
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "var(--tg-orange)",
          }}
        >
          (◆)
        </span>
      </div>
      <div
        style={{
          padding: "40px var(--tg-content-pad) 44px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 32,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "var(--tg-font-display)",
              fontWeight: 700,
              fontStretch: "115%",
              fontSize: "clamp(24px, 3vw, 38px)",
              letterSpacing: "-0.015em",
              color: "var(--tg-ink)",
              lineHeight: 1.02,
              margin: "0 0 10px",
            }}
          >
            Three dispatches a week.
            <br />
            Zero hype.
          </h3>
          <p
            style={{
              fontFamily: "var(--tg-font-mono)",
              fontSize: 11,
              letterSpacing: "0.04em",
              color: "var(--tg-mute)",
              margin: 0,
            }}
          >
            The signal on dealership AI, before it hits the floor.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {/* Subscribe flow not built yet (Phase 4). */}
          <span
            className="tg-btn"
            aria-disabled="true"
            title="Subscribe — not yet wired (Phase 4 newsletter)"
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          >
            Subscribe →
          </span>
          <span className="tg-needs">⟨NEEDS CONTENT: subscribe flow⟩</span>
        </div>
      </div>
    </div>
  );
}
