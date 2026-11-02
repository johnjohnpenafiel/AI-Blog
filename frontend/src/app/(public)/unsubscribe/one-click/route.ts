import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * RFC 8058 one-click unsubscribe — the `List-Unsubscribe` header in every post
 * email points here. Mail clients (Gmail's native "Unsubscribe" button) POST a
 * form body with the token in the query string; we forward it to the backend
 * so the email links stay on the public site's domain. POST only: a GET here
 * would let link-prefetching scanners unsubscribe people.
 */
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const backendUrl = process.env.BACKEND_URL;
  if (!token || !backendUrl) {
    return NextResponse.json({ detail: "invalid request" }, { status: 400 });
  }
  const res = await fetch(
    `${backendUrl}/public/unsubscribe/one-click?token=${encodeURIComponent(token)}`,
    { method: "POST", cache: "no-store" },
  );
  return NextResponse.json(await res.json().catch(() => ({})), {
    status: res.status,
  });
}
