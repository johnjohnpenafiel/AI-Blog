import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function backendError(): NextResponse {
  return NextResponse.json(
    { error: "BACKEND_URL is not configured" },
    { status: 500 },
  );
}

export async function GET() {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return backendError();

  const res = await fetch(`${backendUrl}/settings`, { cache: "no-store" });
  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}

export async function PATCH(req: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return backendError();

  const body = await req.text();
  const res = await fetch(`${backendUrl}/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: body || "{}",
    cache: "no-store",
  });
  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}
