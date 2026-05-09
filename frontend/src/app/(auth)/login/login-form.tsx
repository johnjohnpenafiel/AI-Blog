"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        DeLorean / Admin
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[0.7rem] tracking-[0.18em] text-muted uppercase">
            Email
          </span>
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@delorean.app"
            autoComplete="username"
            required
            disabled={submitting}
            className="h-10 rounded-none border-border bg-bg font-mono text-sm text-fg placeholder:text-muted focus-visible:border-accent focus-visible:ring-0"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-mono text-[0.7rem] tracking-[0.18em] text-muted uppercase">
            Password
          </span>
          <Input
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            disabled={submitting}
            className="h-10 rounded-none border-border bg-bg font-mono text-sm text-fg placeholder:text-muted focus-visible:border-accent focus-visible:ring-0"
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
          disabled={submitting}
          className="mt-2 h-10 w-full rounded-none bg-accent font-mono text-sm tracking-[0.2em] text-white uppercase hover:bg-accent-dim disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
