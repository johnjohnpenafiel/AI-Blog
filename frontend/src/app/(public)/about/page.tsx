import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — The Garage AI",
  description:
    "The Garage AI is an automated intelligence dispatch on the AI reshaping how dealerships sell, service, and operate — researched, written, illustrated, and published by a pipeline, three mornings a week. Nothing here pretends to be handwritten.",
};

/**
 * About — the machine's SPEC SHEET, in the v5/Post-v2 stage voice.
 *
 * The page leads with the brand's most differentiating fact — the whole
 * publication is a machine, disclosed — and walks the reader down the
 * assembly line: hero confession → the beat → the six-step pipeline → the
 * Mon/Thu/Fri cadence (neon triad) → the POV manifesto → the reader
 * contract → the one human → a single CTA back to reading.
 */

/** The six queried sections of the taxonomy — the beat, department by
    department (mirrors `backend/taxonomy.py`'s queried sections). */
const DEPARTMENTS = [
  "Customer Experience",
  "Inventory & Merchandising",
  "Pricing & Analytics",
  "Sales & Lead Gen / BDC",
  "Fixed Ops / Service",
  "CRM & Marketing",
];

const OFF_BEAT = [
  "OEM & manufacturing",
  "autonomy",
  "EV punditry",
  "consumer car reviews",
];

/** The pipeline, step by step — the honest anatomy of a dispatch. */
const STEPS = [
  {
    name: "Sweep",
    desc: "Six intent-tuned queries sweep the week's news every run morning — one per department of the store.",
  },
  {
    name: "Sort",
    desc: "A classifier model reads every article, throws out the press releases, and scores what survives for operator importance.",
  },
  {
    name: "Pick",
    desc: "Departments compete for the slot; the one with the most consequential week wins. No repeats two runs in a row — and a thin week is skipped, not padded.",
  },
  {
    name: "Write",
    desc: "Claude drafts the dispatch from the winning sources in the house voice — operator-first, every claim traceable to something it read.",
  },
  {
    name: "Judge",
    desc: "An automated editor scores the draft — point of view, format, grounding — and the scores stay on the record.",
  },
  {
    name: "Paint",
    desc: "An art-director model turns the story's tension into one symbolic cover. No stock photos. Ever.",
  },
];

/** The Mon/Thu/Fri cadence — format names wear the homepage manifesto's
    neon triad (same accent per format, sitewide consistency). */
const CADENCE = [
  {
    when: "Mon · 08:00",
    name: "The Brief",
    neon: "tg-home-neon-cyan",
    desc: "Two minutes, one story: the week's most consequential move, in the shape of a memo. Read it between the huddle and the first customer.",
  },
  {
    when: "Thu · 08:00",
    name: "The Deep Dive",
    neon: "tg-home-neon-magenta",
    desc: "The teardown: the week's big story taken apart across every source we read — what it means for the store, and what to ask your vendor.",
  },
  {
    when: "Fri · 08:00",
    name: "The Roundup",
    neon: "tg-home-neon-green",
    desc: "The week, closed out: the big story, what else moved, and what's worth watching next week.",
  },
];

/** The reader contract — numbered clauses, the editorial promises. */
const CLAUSES = [
  {
    title: "Sources, always.",
    text: "Every dispatch lists what it read — title, publisher, date, link. If we can't cite it, we don't print it.",
  },
  {
    title: "The niche, kept.",
    text: "Dealership operations only. If it doesn't change how a store runs, it doesn't run here.",
  },
  {
    title: "The machine, disclosed.",
    text: "Nothing on this site pretends to be handwritten. You always know exactly how it was made — it says so on the tin.",
  },
  {
    title: "Hype, named.",
    text: "Vendor noise gets called vendor noise — even when the vendor is an AI company like the ones this machine is built from.",
  },
];

export default function AboutPage() {
  return (
    <div className="tg-about">
      {/* Hero — the confession as the headline */}
      <header className="tg-about-hero">
        <div className="tg-about-kicker">{"// About The Garage AI"}</div>
        <h1 className="tg-about-title">
          This publication is{" "}
          <span className="tg-about-title-accent">a machine.</span>
        </h1>
        <p className="tg-about-stand">
          The Garage AI is an automated intelligence dispatch on the AI
          reshaping how dealerships sell, service, and operate — researched,
          written, illustrated, and published by a pipeline, three mornings a
          week, for the people running the store. Nothing here pretends to be
          handwritten. The transparency is the point.
        </p>
      </header>

      {/* The beat */}
      <section className="tg-about-band">
        <div className="tg-seclabel">/ The beat</div>
        <h2 className="tg-about-h2">
          AI as the dealership operating system.
        </h2>
        <p className="tg-about-copy">
          One niche, told department by department: the software and strategy
          rewiring how stores sell, service, price, and follow up. Voice AI
          answering the service line at 2 AM. Machine-learning desking that
          prices a trade before the coffee is poured. BDC agents that never
          forget to call back.
        </p>
        <ul className="tg-about-depts">
          {DEPARTMENTS.map((d) => (
            <li key={d} className="tg-about-dept">
              {d}
            </li>
          ))}
        </ul>
        <p className="tg-about-not">
          Not on the beat:{" "}
          {OFF_BEAT.map((item, i) => (
            <span key={item}>
              <s>{item}</s>
              {i < OFF_BEAT.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      </section>

      {/* The machine */}
      <section className="tg-about-band">
        <div className="tg-seclabel">/ The machine</div>
        <h2 className="tg-about-h2">Six steps, no bylines.</h2>
        <p className="tg-about-copy">
          Every dispatch rolls off the same line. This is the whole factory:
        </p>
        <ol className="tg-about-steps">
          {STEPS.map((s, i) => (
            <li key={s.name} className="tg-about-step">
              <span className="tg-about-step-num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="tg-about-step-name">{s.name}</span>
              <span className="tg-about-step-desc">{s.desc}</span>
            </li>
          ))}
        </ol>
        <p className="tg-about-step-out">
          → On the site by 08:00 · Sources listed · Human edits: 0
        </p>
      </section>

      {/* The cadence */}
      <section className="tg-about-band">
        <div className="tg-seclabel">/ The cadence</div>
        <h2 className="tg-about-h2">Three mornings, three shapes.</h2>
        <div className="tg-about-cadence">
          {CADENCE.map((c) => (
            <div key={c.name} className="tg-about-day">
              <div className="tg-about-day-when">{c.when}</div>
              <div className={`tg-about-day-name ${c.neon}`}>{c.name}</div>
              <p className="tg-about-day-desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The point of view */}
      <section className="tg-about-band">
        <div className="tg-seclabel">/ The point of view</div>
        <div className="tg-about-pov">
          <h2 className="tg-about-h2">Operator-first. Proof over hype.</h2>
          <p className="tg-about-copy">
            Every dispatch answers one question: what does this actually mean
            for my store — will it make money, save time, keep customers —
            and does it work, or is it vendor noise? We don&apos;t cover AI
            because it&apos;s interesting. We cover it because you&apos;re
            being sold it daily, and somebody should check the math.
          </p>
          <div className="tg-about-sig">— The Garage Desk</div>
        </div>
      </section>

      {/* The contract */}
      <section className="tg-about-band">
        <div className="tg-seclabel">/ The contract</div>
        <ol className="tg-about-clauses">
          {CLAUSES.map((c, i) => (
            <li key={c.title} className="tg-about-clause">
              <span className="tg-about-clause-num">
                §{String(i + 1).padStart(2, "0")}
              </span>
              <span className="tg-about-clause-body">
                <span className="tg-about-clause-title">{c.title}</span>
                <span className="tg-about-clause-text">{c.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* The garage — the humans behind the machine */}
      <section className="tg-about-band">
        <div className="tg-seclabel">/ The garage</div>
        <h2 className="tg-about-h2">Mechanics, not authors.</h2>
        <p className="tg-about-copy">
          The humans behind The Garage AI don&apos;t write a word of it.
          They build the machine, tune its judgment, watch its scores, and
          fix what breaks — hands on the wrenches, not the keyboard. The
          machine does the reporting. The humans keep it honest.
        </p>
      </section>

      {/* CTA — one door out: back to the dispatches */}
      <div className="tg-about-cta">
        <span className="tg-about-cta-line">
          {"// Enough about the machine"}
        </span>
        <Link href="/" className="tg-btn tg-about-cta-btn">
          Read the latest dispatch →
        </Link>
      </div>
    </div>
  );
}
