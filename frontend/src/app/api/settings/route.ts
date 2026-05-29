import type { NextRequest } from "next/server";

import { proxyToBackend } from "@/lib/proxy-backend";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return proxyToBackend(req, "/settings");
}

export async function PATCH(req: NextRequest) {
  const body = await req.text();
  return proxyToBackend(req, "/settings", {
    method: "PATCH",
    body: body || "{}",
  });
}
