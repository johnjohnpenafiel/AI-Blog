import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
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
  const res = await fetch(`${backendUrl}/posts/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Backend returned an error" },
      { status: res.status },
    );
  }
  return NextResponse.json(await res.json());
}
