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
}

export interface PostDetail extends PostListItem {
  meta_description: string;
  content: string;
  publishing_mode: PublishingMode;
  updated_at: string;
  sources: PostSource[];
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
  action: "accept" | "reject" | "regenerate" | "reschedule" | "unschedule" | "publish",
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
