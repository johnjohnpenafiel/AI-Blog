import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { error: "BACKEND_URL is not configured" },
      { status: 500 },
    );
  }

  const { id } = await ctx.params;
  const body = await req.text();
  const res = await fetch(
    `${backendUrl}/posts/${encodeURIComponent(id)}/regenerate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body || "{}",
      cache: "no-store",
    },
  );

  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}
