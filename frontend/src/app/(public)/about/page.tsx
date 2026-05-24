import type { Metadata } from "next";

import { ChamferedPanel } from "@/components/chamfered-panel";
import { GlowOrb } from "@/components/public/glow-orb";

export const metadata: Metadata = {
  title: "About — The Garage AI",
  description:
    "The Garage AI is an automated twice-weekly blog covering AI and operational technology developments in the automotive industry.",
};

const sections = [
  {
    index: "01",
    label: "What We Cover",
    body: `The Garage AI tracks the intersection of artificial intelligence and automotive operations — the software, services, and strategies reshaping how dealerships sell, service, and manage vehicles. We focus on what operators and executives actually need to know: voice AI changing the service drive, pricing and inventory tools built on machine learning, CRM modernization, and the quiet infrastructure shifts that precede the visible ones. No car enthusiasm, no consumer reviews. Just operational intelligence for the people running the business.`,
  },
  {
    index: "02",
    label: "How It Works",
    body: `Every Monday and Thursday at 8 AM, an automated pipeline queries Perplexity Sonar for recent automotive AI news, identifies the most relevant developments of the past week, and sends those sources to Claude — Anthropic's large language model — to synthesize into a 600–900 word post. The result is reviewed, accepted, and published. No human journalist in the loop; the editorial judgment is in the pipeline design. Sources are listed on every post because transparency about how the content is made is part of the editorial contract with readers.`,
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <GlowOrb
          size={1000}
          className="-top-60 left-1/2 -translate-x-1/2 opacity-80"
        />

        <div className="relative mx-auto flex min-h-[100vh] max-w-5xl flex-col justify-center px-6 py-28">
          <div className="h-px w-full bg-[var(--border-dim)]" />

          <div className="mt-4 font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
            <span className="text-accent">{"// ABOUT THE GARAGE AI"}</span>
          </div>

          <h1 className="mt-8 font-display text-[48px] font-bold leading-[1.05] tracking-[0.01em] text-fg sm:text-[64px] md:text-[80px]">
            The Pulse of{" "}
            <span className="text-accent">AI and Technology</span>{" "}
            Reshaping the Automotive Industry
          </h1>

          <div className="mt-8 h-px w-full bg-[var(--border-dim)]" />

          <p className="mt-6 max-w-2xl font-mono text-[11px] leading-relaxed tracking-[0.15em] text-muted uppercase">
            Automated twice-weekly dispatches on the software, services, and
            strategies transforming how dealerships and automotive operators
            do business.
          </p>
        </div>
      </section>

      {/* Content sections */}
      <div className="mx-auto max-w-5xl space-y-6 px-6 pb-24">
        {sections.map((section) => (
          <ChamferedPanel
            key={section.index}
            tier="component"
            size="card"
            cut="single"
          >
            <div className="px-8 py-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
                  {`// ${section.index}`}
                </span>
                <span className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
                  {section.label}
                </span>
                <span className="h-px flex-1 bg-[var(--border-dim)]" />
              </div>
              <p className="max-w-3xl text-[16px] leading-[1.75] text-fg/85">
                {section.body}
              </p>
            </div>
          </ChamferedPanel>
        ))}
      </div>
    </>
  );
}
