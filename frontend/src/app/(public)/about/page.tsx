import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — The Garage AI",
  description:
    "The Garage AI is an automated dispatch covering the AI reshaping how automotive dealerships sell, service, and operate — three times a week, in plain language, for the people running the store.",
};

const SECTIONS = [
  {
    marker: "(01)",
    label: "// What we cover",
    heading: "Operational intelligence, not car enthusiasm",
    body: [
      "The Garage AI tracks the intersection of artificial intelligence and dealership operations — the software, services, and strategies reshaping how stores sell, service, and merchandise vehicles. Voice AI on the service drive, machine-learning desking and inventory pricing, autonomous BDC and CRM follow-up, generative merchandising on the VDP.",
      "We stay in one niche: AI as the dealership operating system, told department by department. No OEM/manufacturing, no connected-vehicle data, no consumer reviews — just what the people running the store actually need to know.",
    ],
  },
  {
    marker: "(02)",
    label: "// How it works",
    heading: "An automated pipeline, with the judgment in the design",
    body: [
      "Three times a week at 08:00, an automated pipeline produces a dispatch. Monday and Thursday it queries Perplexity Sonar for recent dealership-AI news, ranks the most operator-relevant developments of the week, and sends those sources to Claude to synthesize — a 2-minute Brief on Monday, a longer Deep Dive on Thursday. Friday produces a Roundup of the week's own coverage.",
      "There is no human journalist in the loop; the editorial judgment lives in the pipeline. Every dispatch lists its sources, because being transparent about how the content is made is part of the contract with the reader.",
    ],
  },
  {
    marker: "(03)",
    label: "// The point of view",
    heading: "Operator-first, proof over hype",
    body: [
      "Every dispatch answers one question: what does this actually mean for my store — will it make money, save time, retain customers — and does it work, or is it vendor noise? Claims are concrete and measurable, never aspirational fluff. Two dispatches of signal, one of synthesis, zero hype.",
    ],
  },
];

function band(
  marker: string,
  children: React.ReactNode,
  opts: { band?: boolean; topRule?: boolean } = {},
) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "var(--tg-gutter) 1fr",
        borderBottom: "1px solid var(--tg-frame-hair)",
        borderTop: opts.topRule ? "1px solid var(--tg-frame-hair)" : undefined,
        background: opts.band ? "var(--tg-band)" : "var(--tg-bg)",
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
          {marker}
        </span>
      </div>
      <div style={{ padding: "44px var(--tg-content-pad) 48px 0" }}>{children}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* intro */}
      {band(
        "(✶)",
        <>
          <span className="tg-kicker" style={{ color: "var(--tg-sand)" }}>
            {"// About The Garage AI"}
          </span>
          <h1
            style={{
              fontFamily: "var(--tg-font-display)",
              fontWeight: 700,
              fontStretch: "118%",
              fontSize: "clamp(36px, 5vw, 68px)",
              lineHeight: 0.98,
              letterSpacing: "-0.02em",
              color: "var(--tg-ink)",
              margin: "16px 0 24px",
              maxWidth: 900,
            }}
          >
            AI as the dealership{" "}
            <span style={{ color: "var(--tg-orange)" }}>operating system</span>.
          </h1>
          <p
            style={{
              fontFamily: "var(--tg-font-display)",
              fontWeight: 400,
              fontStretch: "112%",
              fontSize: 21,
              lineHeight: 1.5,
              color: "var(--tg-mute)",
              maxWidth: 720,
              margin: 0,
            }}
          >
            An automated intelligence dispatch on the artificial intelligence
            reshaping how automotive dealerships sell, service, and operate —
            three times a week, in plain language, for the people running the
            store.
          </p>
        </>,
      )}

      {/* content sections */}
      {SECTIONS.map((s, i) =>
        band(
          s.marker,
          <>
            <span className="tg-kicker">{s.label}</span>
            <h2
              style={{
                fontFamily: "var(--tg-font-display)",
                fontWeight: 700,
                fontStretch: "112%",
                fontSize: "clamp(24px, 3vw, 38px)",
                lineHeight: 1.06,
                letterSpacing: "-0.015em",
                color: "var(--tg-ink)",
                margin: "12px 0 22px",
                maxWidth: 760,
              }}
            >
              {s.heading}
            </h2>
            {s.body.map((p, j) => (
              <p
                key={j}
                style={{
                  fontFamily: "var(--tg-font-display)",
                  fontWeight: 400,
                  fontStretch: "110%",
                  fontSize: 18,
                  lineHeight: 1.62,
                  color: "#d2cec8",
                  margin: j === s.body.length - 1 ? 0 : "0 0 20px",
                  maxWidth: 700,
                }}
              >
                {p}
              </p>
            ))}
          </>,
          { band: i % 2 === 0 },
        ),
      )}
    </>
  );
}
