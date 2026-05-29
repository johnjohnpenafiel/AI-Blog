import type { NextRequest } from "next/server";

import { proxyToBackend } from "@/lib/proxy-backend";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return proxyToBackend(req, "/posts", {
    searchParams: req.nextUrl.searchParams.toString(),
  });
}
