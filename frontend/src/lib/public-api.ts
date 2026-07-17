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
  section: string | null;
  format: string | null;
  image_url: string | null;
  published_at: string;
  read_time_minutes: number;
}

export interface PublicPostListResponse {
  items: PublicPostListItem[];
  total: number;
}

export interface PublicFeaturedPost extends PublicPostListItem {
  /** true = a real editor's-choice pin; false = most-recent fallback. */
  is_featured: boolean;
}

export interface PublicPostSource {
  title: string;
  url: string;
  publisher: string;
  published_date: string | null;
}

export interface PublicPostDetail {
  id: string;
  slug: string;
  title: string;
  summary: string;
  meta_description: string;
  content: string;
  tags: string[];
  section: string | null;
  format: string | null;
  image_url: string | null;
  published_at: string;
  read_time_minutes: number;
  sources: PublicPostSource[];
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

/**
 * The post for the homepage featured (★) band: the editor's-choice pin when one
 * exists, otherwise the most-recent published post (with `is_featured: false`).
 * Returns null only when nothing is published yet.
 */
export async function getFeaturedPost(): Promise<PublicFeaturedPost | null> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("BACKEND_URL is not configured");
  }

  const res = await fetch(`${backendUrl}/public/posts/featured`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Featured post fetch failed: ${res.status}`);
  }
  // The endpoint returns a JSON `null` body when nothing is published.
  return (await res.json()) as PublicFeaturedPost | null;
}

export async function getPublicPost(slug: string): Promise<PublicPostDetail> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("BACKEND_URL is not configured");
  }

  const res = await fetch(`${backendUrl}/public/posts/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (res.status === 404) {
    return Promise.reject(new NotFoundError("post not found"));
  }
  if (!res.ok) {
    throw new Error(`Public post fetch failed: ${res.status}`);
  }
  return res.json();
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
