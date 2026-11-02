"use client";

import { useActionState } from "react";

import { subscribeAction, type SubscribeState } from "@/lib/subscribe-actions";

const INITIAL: SubscribeState = { status: "idle", message: "" };

/**
 * The /subscribe signup form — one email field and the shared mono button.
 * On success the form is replaced by a "check your inbox" readout (double
 * opt-in: nothing is sent until the reader clicks the confirm link).
 */
export function SubscribeForm() {
  const [state, formAction, pending] = useActionState(subscribeAction, INITIAL);

  if (state.status === "ok") {
    return (
      <div className="tg-sub-done" role="status">
        <div className="tg-sub-done-label">{"// Check your inbox"}</div>
        <p className="tg-sub-done-copy">
          We sent a confirmation link to{" "}
          <span className="tg-sub-email">{state.message}</span>. Click it and
          you&apos;re on the list. Nothing arrives until you do.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="tg-sub-form" noValidate>
      <label htmlFor="tg-sub-email" className="tg-sub-label">
        Email address
      </label>
      <div className="tg-sub-row">
        <input
          id="tg-sub-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@yourstore.com"
          className="tg-sub-input"
          aria-invalid={state.status === "error" || undefined}
          aria-describedby="tg-sub-msg"
        />
        <button type="submit" className="tg-btn tg-sub-btn" disabled={pending}>
          {pending ? "Sending…" : "Subscribe →"}
        </button>
      </div>
      <p id="tg-sub-msg" className="tg-sub-msg" aria-live="polite">
        {state.status === "error" ? state.message : ""}
      </p>
    </form>
  );
}
