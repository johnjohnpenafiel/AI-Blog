import type { Metadata } from "next";

import { TokenActionForm } from "@/components/public/token-action-form";
import { unsubscribeAction } from "@/lib/subscribe-actions";

export const metadata: Metadata = {
  title: "Unsubscribe — The Garage AI",
  robots: { index: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="tg-about tg-sub">
      <header className="tg-about-hero">
        <div className="tg-about-kicker">{"// Unsubscribe"}</div>
        <h1 className="tg-about-title">
          Stop the <span className="tg-about-title-accent">emails?</span>
        </h1>
        <p className="tg-about-stand">
          You&apos;ll stop getting dispatches by email. The site stays open —
          every post is still here whenever you want it.
        </p>
      </header>
      <section className="tg-about-band">
        <TokenActionForm
          token={typeof token === "string" ? token : ""}
          action={unsubscribeAction}
          buttonLabel="Unsubscribe"
          done={{
            heading: "Unsubscribed",
            body: "You won't get any more emails from The Garage AI. Changed your mind? You can subscribe again anytime.",
          }}
          invalid={{
            heading: "Link not recognized",
            body: "This unsubscribe link is invalid. Use the link from the bottom of any Garage AI email.",
          }}
        />
      </section>
    </div>
  );
}
