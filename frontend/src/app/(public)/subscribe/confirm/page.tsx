import type { Metadata } from "next";

import { TokenActionForm } from "@/components/public/token-action-form";
import { confirmAction } from "@/lib/subscribe-actions";

export const metadata: Metadata = {
  title: "Confirm subscription — The Garage AI",
  robots: { index: false },
};

export default async function ConfirmSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="tg-about tg-sub">
      <header className="tg-about-hero">
        <div className="tg-about-kicker">{"// Subscribe"}</div>
        <h1 className="tg-about-title">
          One click <span className="tg-about-title-accent">left.</span>
        </h1>
        <p className="tg-about-stand">
          Confirm your email and every new dispatch lands in your inbox the
          morning it publishes.
        </p>
      </header>
      <section className="tg-about-band">
        <TokenActionForm
          token={typeof token === "string" ? token : ""}
          action={confirmAction}
          buttonLabel="Confirm subscription →"
          done={{
            heading: "You're on the list",
            body: "Subscription confirmed. The next dispatch will be in your inbox the morning it publishes.",
          }}
          invalid={{
            heading: "Link expired",
            body: "This confirmation link is invalid or was already used. If you're not subscribed yet, sign up again from the Subscribe page.",
          }}
        />
      </section>
    </div>
  );
}
