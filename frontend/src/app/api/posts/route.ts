import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { error: "BACKEND_URL is not configured" },
      { status: 500 },
    );
  }

  const query = req.nextUrl.searchParams.toString();
  const url = query ? `${backendUrl}/posts?${query}` : `${backendUrl}/posts`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Backend returned an error" },
      { status: res.status },
    );
  }
  return NextResponse.json(await res.json());
}
