"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { TokenActionState } from "@/lib/subscribe-actions";

const INITIAL: TokenActionState = { status: "idle" };

interface Copy {
  heading: string;
  body: string;
}

interface Props {
  token: string;
  action: (prev: TokenActionState, formData: FormData) => Promise<TokenActionState>;
  buttonLabel: string;
  done: Copy;
  invalid: Copy;
}

/**
 * One-button form for the emailed confirm / unsubscribe links. The action
 * fires on an explicit click, not on page load: mail-security scanners
 * pre-fetch links, and a GET that changed state would let them confirm or
 * unsubscribe people on their own.
 */
export function TokenActionForm({ token, action, buttonLabel, done, invalid }: Props) {
  const [state, formAction, pending] = useActionState(action, INITIAL);

  if (state.status === "done" || state.status === "invalid") {
    const copy = state.status === "done" ? done : invalid;
    return (
      <div className="tg-sub-done" role="status">
        <div className="tg-sub-done-label">{`// ${copy.heading}`}</div>
        <p className="tg-sub-done-copy">{copy.body}</p>
        <Link href="/" className="tg-btn tg-about-cta-btn tg-sub-back">
          Read the latest dispatch →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="tg-sub-form">
      <input type="hidden" name="token" value={token} />
      <button type="submit" className="tg-btn tg-sub-btn" disabled={pending}>
        {pending ? "Working…" : buttonLabel}
      </button>
      <p className="tg-sub-msg" aria-live="polite">
        {state.status === "error" ? "Something went wrong. Try again in a minute." : ""}
      </p>
    </form>
  );
}
