"use server";

/**
 * Server Actions for the public subscription pages. They run on the Next.js
 * server, so they can reach the backend via the server-only `BACKEND_URL`
 * (same as `public-api.ts`) — the browser never talks to the backend.
 * The `/public/*` subscription routes carry no auth; the emailed tokens are
 * the credential.
 */

export interface SubscribeState {
  status: "idle" | "ok" | "error";
  message: string;
}

export interface TokenActionState {
  status: "idle" | "done" | "invalid" | "error";
}

async function postBackend(path: string, body: unknown): Promise<Response> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) throw new Error("BACKEND_URL is not configured");
  return fetch(`${backendUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

export async function subscribeAction(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { status: "error", message: "Enter your email address." };
  }
  try {
    const res = await postBackend("/public/subscribe", { email });
    if (res.status === 422) {
      return { status: "error", message: "That doesn't look like an email address." };
    }
    if (!res.ok) {
      return {
        status: "error",
        message: "We couldn't send the confirmation email. Try again in a minute.",
      };
    }
    return { status: "ok", message: email };
  } catch {
    return { status: "error", message: "Something went wrong. Try again in a minute." };
  }
}

async function tokenAction(
  path: string,
  formData: FormData,
): Promise<TokenActionState> {
  const token = String(formData.get("token") ?? "");
  if (!token) return { status: "invalid" };
  try {
    const res = await postBackend(path, { token });
    if (res.status === 404) return { status: "invalid" };
    return { status: res.ok ? "done" : "error" };
  } catch {
    return { status: "error" };
  }
}

export async function confirmAction(
  _prev: TokenActionState,
  formData: FormData,
): Promise<TokenActionState> {
  return tokenAction("/public/subscribe/confirm", formData);
}

export async function unsubscribeAction(
  _prev: TokenActionState,
  formData: FormData,
): Promise<TokenActionState> {
  return tokenAction("/public/unsubscribe", formData);
}
