import type { Metadata } from "next";

import { SubscribeForm } from "@/components/public/subscribe-form";

export const metadata: Metadata = {
  title: "Subscribe — The Garage AI",
  description:
    "Get every Garage AI dispatch by email — the Monday Brief, the Thursday Deep Dive, and the Friday Roundup.",
};

/** What lands in the inbox — the Mon/Thu/Fri cadence in the About page's
    neon format triad. */
const CADENCE = [
  { when: "Mon", name: "The Brief", neon: "tg-home-neon-cyan" },
  { when: "Thu", name: "The Deep Dive", neon: "tg-home-neon-magenta" },
  { when: "Fri", name: "The Roundup", neon: "tg-home-neon-green" },
];

/**
 * Subscribe — the About page's hero voice with a single signup form. Double
 * opt-in: submitting sends a confirmation email; the reader is only on the
 * list after clicking it (/subscribe/confirm).
 */
export default function SubscribePage() {
  return (
    <div className="tg-about tg-sub">
      <header className="tg-about-hero">
        <div className="tg-about-kicker">{"// Subscribe"}</div>
        <h1 className="tg-about-title">
          Every dispatch, <span className="tg-about-title-accent">in your inbox.</span>
        </h1>
        <p className="tg-about-stand">
          Three mornings a week, the machine files its report on the AI
          reshaping how dealerships sell, service, and operate. Get each one
          by email the moment it publishes.
        </p>
      </header>

      <section className="tg-about-band">
        <div className="tg-seclabel">/ Sign up</div>
        <SubscribeForm />
        <ul className="tg-sub-cadence">
          {CADENCE.map((c) => (
            <li key={c.name}>
              <span className="tg-sub-cadence-when">{c.when}</span>
              <span className={c.neon}>{c.name}</span>
            </li>
          ))}
        </ul>
        <p className="tg-sub-fine">
          Three emails a week, no more. No tracking pixels, no list sharing,
          and every email carries a one-click unsubscribe.
        </p>
      </section>
    </div>
  );
}
