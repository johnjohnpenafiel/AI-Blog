import { GlowOrb } from "@/components/public/glow-orb";

/**
 * Hero replacement when no posts have been published yet — keeps the
 * atmospheric framing without leaving the page visually broken.
 */
export function HeroEmpty() {
  return (
    <section
      data-testid="public-hero-empty"
      className="relative isolate overflow-hidden"
    >
      <GlowOrb size={780} className="-top-40 right-[-12rem] opacity-90" />

      <div className="relative mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center px-6 py-24">
        <div className="h-px w-full bg-[var(--border-dim)]" />

        <div className="mt-4 flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] uppercase">
          <span className="text-accent">{"// COVER STORY"}</span>
          <span className="hidden h-px w-12 bg-[var(--border-dim)] sm:block" />
          <span className="text-muted">AWAITING FIRST TRANSMISSION</span>
        </div>

        <h1 className="mt-10 max-w-4xl font-display text-[44px] leading-[1.05] font-bold tracking-[0.01em] text-fg sm:text-[56px]">
          The pulse of <span className="text-accent">AI and operational technology</span>{" "}
          reshaping the automotive industry.
        </h1>

        <div className="mt-8 h-px w-full bg-[var(--border-dim)]" />

        <p className="mt-4 max-w-3xl font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
          {"// NO TRANSMISSIONS FOUND"}
        </p>
      </div>
    </section>
  );
}
