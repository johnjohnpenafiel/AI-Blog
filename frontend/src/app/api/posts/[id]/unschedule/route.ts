import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
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
  const res = await fetch(
    `${backendUrl}/posts/${encodeURIComponent(id)}/unschedule`,
    { method: "POST", cache: "no-store" },
  );

  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}
