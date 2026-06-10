"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.ok) {
      router.push(callbackUrl);
      router.refresh();
      return;
    }

    setError("Invalid email or password.");
    setSubmitting(false);
  }

  return (
    <div className="relative w-full max-w-sm border border-border bg-surface p-8">
      <span
        aria-hidden
        className="absolute -top-px -left-px h-3 w-3 border-t border-l border-fg"
      />

      <p className="mb-8 font-mono text-xs tracking-[0.2em] text-muted uppercase">
        The Garage AI / Admin
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[0.7rem] tracking-[0.18em] text-muted uppercase">
            Email
          </span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@thegarage.ai"
            autoComplete="username"
            required
            disabled={submitting}
            className="h-10 w-full border border-border bg-bg px-3 font-mono text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-50"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-mono text-[0.7rem] tracking-[0.18em] text-muted uppercase">
            Password
          </span>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            disabled={submitting}
            className="h-10 w-full border border-border bg-bg px-3 font-mono text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-50"
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="font-mono text-[0.7rem] tracking-[0.18em] text-destructive uppercase"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="mt-2 w-full text-sm tracking-[0.2em]"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
