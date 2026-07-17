export interface PipelineStatus {
  last_run_at: string | null;
  next_run_at: string | null;
  state: "idle" | "running";
}

export async function getPipelineStatus(): Promise<PipelineStatus> {
  const res = await fetch("/api/pipeline/status", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Pipeline status fetch failed: ${res.status}`);
  }
  return res.json();
}

export type PostStatus =
  | "draft"
  | "pending_review"
  | "accepted"
  | "rejected"
  | "published";

export type PublishingMode = "auto" | "approve_only";

export interface PostSource {
  id: string;
  title: string;
  url: string;
  publisher: string;
  published_date: string | null;
}

export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  status: PostStatus;
  created_at: string;
  scheduled_at: string | null;
  published_at: string | null;
  generation_attempt: number;
  // Editor's choice — true on the single post pinned to the homepage featured
  // band. Drives the Published-tab FEATURE/FEATURED toggle + header readout.
  is_featured: boolean;
  // v2 taxonomy (null = unset / not-yet-classified). Admin-only — not surfaced
  // on the public site yet.
  section: string | null;
  format: string | null;
  story_type: string | null;
  // AI-generated cover image URL (null = not generated / failed → placeholder).
  image_url: string | null;
  // Generation-eval scores (0–2 each; null = not scored).
  eval_pov: number | null;
  eval_format: number | null;
  eval_grounding: number | null;
  eval_passed: boolean | null;
}

export interface PostDetail extends PostListItem {
  meta_description: string;
  content: string;
  publishing_mode: PublishingMode;
  updated_at: string;
  sources: PostSource[];
  eval_notes: string | null;
  eval_at: string | null;
}

export interface PostListResponse {
  items: PostListItem[];
  total: number;
}

export async function listPosts(
  status?: PostStatus,
  opts?: { limit?: number; offset?: number },
): Promise<PostListResponse> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (opts?.limit !== undefined) params.set("limit", String(opts.limit));
  if (opts?.offset !== undefined) params.set("offset", String(opts.offset));
  const qs = params.toString();
  const url = qs ? `/api/posts?${qs}` : "/api/posts";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Posts list fetch failed: ${res.status}`);
  }
  return res.json();
}

export async function getPost(id: string): Promise<PostDetail> {
  const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Post detail fetch failed: ${res.status}`);
  }
  return res.json();
}

async function postPostAction(
  id: string,
  action:
    | "accept"
    | "reject"
    | "regenerate"
    | "reschedule"
    | "unschedule"
    | "publish"
    | "feature"
    | "unfeature",
  body?: Record<string, unknown>,
): Promise<PostDetail> {
  const res = await fetch(
    `/api/posts/${encodeURIComponent(id)}/${action}`,
    {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const detail = await res
      .json()
      .then((j) => (typeof j?.detail === "string" ? j.detail : null))
      .catch(() => null);
    throw new Error(detail ?? `Post ${action} failed: ${res.status}`);
  }
  return res.json();
}

export function acceptPost(
  id: string,
  scheduledAt?: string,
): Promise<PostDetail> {
  return postPostAction(
    id,
    "accept",
    scheduledAt ? { scheduled_at: scheduledAt } : {},
  );
}

export function rejectPost(id: string): Promise<PostDetail> {
  return postPostAction(id, "reject");
}

export function regeneratePost(
  id: string,
  feedback?: string,
): Promise<PostDetail> {
  const trimmed = feedback?.trim();
  return postPostAction(
    id,
    "regenerate",
    trimmed ? { feedback: trimmed } : {},
  );
}

export function reschedulePost(
  id: string,
  scheduledAt: string,
): Promise<PostDetail> {
  return postPostAction(id, "reschedule", { scheduled_at: scheduledAt });
}

export function unschedulePost(id: string): Promise<PostDetail> {
  return postPostAction(id, "unschedule");
}

export function publishPost(id: string): Promise<PostDetail> {
  return postPostAction(id, "publish");
}

export function featurePost(id: string): Promise<PostDetail> {
  return postPostAction(id, "feature");
}

export function unfeaturePost(id: string): Promise<PostDetail> {
  return postPostAction(id, "unfeature");
}

/**
 * The post currently pinned to the homepage featured band, or null when none is
 * pinned. Read from a dedicated endpoint (not derived from the published list)
 * so the dashboard readout is correct even when the pin has scrolled past the
 * first page.
 */
export async function getFeaturedPost(): Promise<PostListItem | null> {
  const res = await fetch("/api/posts/featured", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Featured post fetch failed: ${res.status}`);
  }
  return (await res.json()) as PostListItem | null;
}

export interface Settings {
  publishing_mode: PublishingMode;
  schedule_frequency: string;
  last_run_at: string | null;
  next_run_at: string | null;
}

export async function getSettings(): Promise<Settings> {
  const res = await fetch("/api/settings", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Settings fetch failed: ${res.status}`);
  }
  return res.json();
}

export async function updateSettings(body: {
  publishing_mode: PublishingMode;
}): Promise<Settings> {
  const res = await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res
      .json()
      .then((j) => (typeof j?.detail === "string" ? j.detail : null))
      .catch(() => null);
    throw new Error(detail ?? `Settings update failed: ${res.status}`);
  }
  return res.json();
}

export interface PipelineRunSuccess {
  skipped: false;
  post_id: string;
  slug: string;
  status: PostStatus;
  publishing_mode: PublishingMode;
  published_at: string | null;
}

export interface PipelineRunSkipped {
  skipped: true;
  reason: string;
  article_count: number;
}

export type PipelineRunResult = PipelineRunSuccess | PipelineRunSkipped;

export class PipelineConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PipelineConflictError";
  }
}

export async function triggerPipelineRun(): Promise<PipelineRunResult> {
  const res = await fetch("/api/pipeline/run", {
    method: "POST",
    cache: "no-store",
  });
  if (res.status === 409) {
    const detail = await res
      .json()
      .then((j) => (typeof j?.detail === "string" ? j.detail : null))
      .catch(() => null);
    throw new PipelineConflictError(detail ?? "pipeline already running");
  }
  if (!res.ok) {
    const detail = await res
      .json()
      .then((j) => (typeof j?.detail === "string" ? j.detail : null))
      .catch(() => null);
    throw new Error(detail ?? `Pipeline run failed: ${res.status}`);
  }
  return res.json();
}
