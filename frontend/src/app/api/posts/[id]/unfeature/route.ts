import type { NextRequest } from "next/server";

import { proxyToBackend } from "@/lib/proxy-backend";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return proxyToBackend(req, `/posts/${encodeURIComponent(id)}/unfeature`, {
    method: "POST",
  });
}
