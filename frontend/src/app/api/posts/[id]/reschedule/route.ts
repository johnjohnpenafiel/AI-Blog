import type { NextRequest } from "next/server";

import { proxyToBackend } from "@/lib/proxy-backend";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await req.text();
  return proxyToBackend(req, `/posts/${encodeURIComponent(id)}/reschedule`, {
    method: "POST",
    body: body || "{}",
  });
}
