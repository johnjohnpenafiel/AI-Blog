import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — The Garage AI",
  description:
    "The Garage AI is an automated blog covering AI and operational technology developments in the automotive industry, publishing three times a week.",
};

const sections = [
  {
    index: "01",
    label: "What We Cover",
    body: `The Garage AI tracks the intersection of artificial intelligence and automotive operations — the software, services, and strategies reshaping how dealerships sell, service, and manage vehicles. We focus on what operators and executives actually need to know: voice AI changing the service drive, pricing and inventory tools built on machine learning, CRM modernization, and the quiet infrastructure shifts that precede the visible ones. No car enthusiasm, no consumer reviews — just operational intelligence for the people running the business.`,
  },
  {
    index: "02",
    label: "How It Works",
    body: `Every Monday, Thursday, and Friday at 8 AM, an automated pipeline produces a post. On Monday and Thursday it queries Perplexity Sonar for recent automotive AI news, identifies the most operator-relevant developments of the past week, and sends those sources to Claude — Anthropic's large language model — to synthesize into a post: a concise Brief on Monday and a longer Deep Dive on Thursday. On Friday it produces a Roundup of the week's own coverage. The result is reviewed, accepted, and published. No human journalist in the loop; the editorial judgment is in the pipeline design. Sources are listed on every post because transparency about how the content is made is part of the editorial contract with readers.`,
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero — matches the public hero pattern (bg-bg, responsive padding,
          cover-story-style label, font-display title, Inter body intro). */}
      <section className="relative isolate min-h-[640px] overflow-hidden bg-bg px-6 pt-20 pb-12 sm:px-10 sm:pt-24 sm:pb-14 lg:px-16 lg:pt-28 lg:pb-16">
        <div className="flex flex-col justify-start gap-8 sm:gap-10 lg:gap-12">
          <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-white uppercase">
            <span>{"// ABOUT"}</span>
            <span className="hidden h-px w-10 bg-white/20 sm:block" />
            <span>The Garage AI</span>
          </div>

          <h1 className="max-w-[760px] font-display text-[30px] leading-[1.1] font-bold tracking-[0.01em] text-white sm:text-[38px] md:text-[46px] lg:text-[54px] xl:text-[64px]">
            The pulse of <span className="text-accent">AI</span> and technology
            reshaping the automotive industry.
          </h1>

          <p className="max-w-none font-sans text-[17px] leading-[1.6] text-white lg:max-w-2xl">
            Automated dispatches three times a week on the software, services,
            and strategies transforming how dealerships and automotive operators
            do business.
          </p>
        </div>
      </section>

      {/* Sections — same horizontal padding system as the index, simple
          label + rule headers, Inter body paragraphs. */}
      <section className="flex flex-col gap-16 px-6 py-12 sm:gap-20 sm:px-10 sm:py-14 lg:gap-24 lg:px-16 lg:py-16">
        {sections.map((section) => (
          <div key={section.index}>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] tracking-[0.25em] text-accent uppercase">
                {`// ${section.index}`}
              </span>
              <span className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
                {section.label}
              </span>
              <span className="h-px flex-1 bg-[var(--border-dim)]" />
            </div>

            <p className="mt-6 max-w-3xl font-sans text-[17px] leading-[1.7] text-fg">
              {section.body}
            </p>
          </div>
        ))}
      </section>
    </>
  );
}
