const tokens = [
  { name: "--bg", value: "#0a0a0a", swatchClass: "bg-bg" },
  { name: "--surface", value: "#111111", swatchClass: "bg-surface" },
  { name: "--border", value: "#222222", swatchClass: "bg-border" },
  { name: "--text-primary", value: "#f0f0f0", swatchClass: "bg-fg" },
  { name: "--text-secondary", value: "#555555", swatchClass: "bg-muted" },
  { name: "--accent", value: "#ff6a00", swatchClass: "bg-accent" },
  { name: "--accent-glow", value: "rgb(255 106 0 / 0.12)", swatchClass: "bg-accent-glow" },
  { name: "--accent-dim", value: "#cc5500", swatchClass: "bg-accent-dim" },
] as const;

const fontSamples = [
  { label: "JETBRAINS MONO 400", className: "font-mono font-normal", text: "// THE PULSE OF AUTOMOTIVE AI" },
  { label: "INTER 400", className: "font-sans font-normal", text: "Body copy renders here at a comfortable reading weight." },
  { label: "INTER 800", className: "font-sans font-extrabold", text: "Heavy display title for hero and section headings." },
  { label: "INTER 900", className: "font-sans font-black", text: "Heaviest weight reserved for the most dominant titles." },
] as const;

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-8 py-16">
      <header className="mb-12 border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {"// FRONTEND-SKELETON · VERIFICATION"}
        </p>
        <h1 className="mt-4 font-sans text-5xl font-black text-fg">
          Design tokens are <span className="text-accent">live</span>.
        </h1>
        <p className="mt-3 font-sans text-base text-muted">
          Placeholder page. Replaced by `public-shell-and-homepage` later.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
          {"// COLOR TOKENS"}
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tokens.map((token) => (
            <li
              key={token.name}
              data-token={token.name}
              className="flex flex-col gap-3 border border-border bg-surface p-4"
            >
              <div className={`h-16 w-full border border-border ${token.swatchClass}`} />
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs uppercase tracking-wide text-fg">
                  {token.name}
                </span>
                <span className="font-mono text-xs text-muted">{token.value}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
          {"// FONTS"}
        </h2>
        <ul className="flex flex-col gap-6">
          {fontSamples.map((sample) => (
            <li
              key={sample.label}
              className="flex flex-col gap-2 border border-border bg-surface p-4"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-muted">
                {sample.label}
              </span>
              <p className={`text-2xl text-fg ${sample.className}`}>{sample.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
