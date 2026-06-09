import type { NextRequest } from "next/server";

import { proxyToBackend } from "@/lib/proxy-backend";

export const dynamic = "force-dynamic";

// Static `featured` segment takes precedence over the sibling `[id]` route, so
// this never collides with GET /api/posts/{id}.
export async function GET(req: NextRequest) {
  return proxyToBackend(req, "/posts/featured");
}
