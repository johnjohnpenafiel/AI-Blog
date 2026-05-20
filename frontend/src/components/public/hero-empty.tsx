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
      <video
        src="/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 -z-20 size-full object-cover object-center"
      />

      <GlowOrb size={780} className="-top-40 right-[-12rem] opacity-90" />

      <div className="relative flex min-h-screen flex-col justify-between px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
        <div className="flex items-center gap-3 self-start bg-black/45 px-3 py-2 font-mono text-[10px] tracking-[0.25em] uppercase shadow-[0_0_0_1px_var(--border-dim)] backdrop-blur-md">
          <span className="text-accent">{"// COVER STORY"}</span>
          <span className="hidden h-px w-10 bg-[var(--border-dim)] sm:block" />
          <span className="text-muted">AWAITING FIRST TRANSMISSION</span>
        </div>

        <div className="mt-auto flex flex-col gap-8">
          <h1 className="max-w-3xl font-display text-[28px] leading-[1.1] font-bold tracking-[0.01em] text-fg drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)] sm:text-[34px] md:text-[40px] lg:text-[46px] xl:text-[52px]">
            The pulse of <span className="text-accent">AI and operational technology</span>{" "}
            reshaping the automotive industry.
          </h1>

          <div className="h-px w-full bg-[var(--border-dim)]" />

          <p className="self-start bg-black/45 px-4 py-3 font-mono text-[11px] leading-[1.6] tracking-[0.18em] text-muted uppercase shadow-[0_0_0_1px_var(--border-dim)] backdrop-blur-md">
            {"// NO TRANSMISSIONS FOUND"}
          </p>
        </div>
      </div>
    </section>
  );
}
