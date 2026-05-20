/**
 * Server-only fetcher for the public blog surface.
 *
 * Calls the backend directly using `BACKEND_URL` (Docker-internal hostname
 * in dev, public origin in prod). Must only be imported by server
 * components or route handlers — the env var is not exposed to the browser.
 *
 * The public surface deliberately does NOT proxy through `/api/*` because
 * there is no auth to enforce and an SSR fetch is one less hop.
 */

export interface PublicPostListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  published_at: string;
  read_time_minutes: number;
}

export interface PublicPostListResponse {
  items: PublicPostListItem[];
  total: number;
}

export async function listPublicPosts(opts?: {
  limit?: number;
  offset?: number;
}): Promise<PublicPostListResponse> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("BACKEND_URL is not configured");
  }

  const params = new URLSearchParams();
  if (opts?.limit !== undefined) params.set("limit", String(opts.limit));
  if (opts?.offset !== undefined) params.set("offset", String(opts.offset));
  const qs = params.toString();
  const url = qs
    ? `${backendUrl}/public/posts?${qs}`
    : `${backendUrl}/public/posts`;

  // `cache: "no-store"` matches the dashboard pattern — content can update
  // on every pipeline run and we want SSR to reflect the latest DB state.
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Public posts fetch failed: ${res.status}`);
  }
  return res.json();
}
