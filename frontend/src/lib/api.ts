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
