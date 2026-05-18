import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { error: "BACKEND_URL is not configured" },
      { status: 500 },
    );
  }

  const res = await fetch(`${backendUrl}/pipeline/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}
