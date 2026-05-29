/**
 * Server-only proxy for the admin surface.
 *
 * Every `/api/*` route that talks to a PROTECTED backend endpoint goes through
 * here. Two jobs:
 *   1. Verify the NextAuth session (same check as `proxy.ts`) — reject with 401
 *      if the caller isn't the logged-in admin, so the proxy can't be used as an
 *      open relay to the backend.
 *   2. Attach the shared `BACKEND_API_SECRET` as a Bearer token on the
 *      server-to-server fetch. The secret lives only in server env and never
 *      reaches the browser.
 *
 * The backend's status code + JSON body are passed straight back to the caller
 * (including 409 from /pipeline/run, 422 validation errors, etc.), so callers in
 * `lib/api.ts` keep working unchanged.
 *
 * The public blog surface does NOT use this — it hits `/public/*` directly via
 * `lib/public-api.ts`, since those routes carry no auth.
 */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface ProxyInit {
  method?: string;
  /** Raw request body to forward (already a JSON string). Omit for no body. */
  body?: string;
  /** Query string (without leading "?") to append to the backend path. */
  searchParams?: string;
}

export async function proxyToBackend(
  req: NextRequest,
  path: string,
  init: ProxyInit = {},
): Promise<NextResponse> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { error: "BACKEND_URL is not configured" },
      { status: 500 },
    );
  }

  const secret = process.env.BACKEND_API_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "BACKEND_API_SECRET is not configured" },
      { status: 500 },
    );
  }

  const url = init.searchParams
    ? `${backendUrl}${path}?${init.searchParams}`
    : `${backendUrl}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${secret}`,
  };
  if (init.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method: init.method ?? "GET",
    headers,
    body: init.body,
    cache: "no-store",
  });

  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}
