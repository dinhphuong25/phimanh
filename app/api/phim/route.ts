import { NextRequest, NextResponse } from "next/server";

// Dynamic route — cache set per-response via Cache-Control headers
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const urlParam = searchParams.get("url");

  if (!urlParam) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlParam);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!parsedUrl.hostname.endsWith("phimapi.com")) {
    return NextResponse.json({ error: "Forbidden host" }, { status: 403 });
  }

  try {
    const res = await fetch(parsedUrl.toString(), {
      // Next.js Data Cache: revalidate after 5 min, serve stale for 10 more min
      next: { revalidate: 300 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PhimanhBot/1.0)",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream error" },
        {
          status: res.status,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        // Browser cache: 5min fresh, serve stale for 10min while revalidating
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        // Vary only on Accept — prevents unnecessary cache splits
        Vary: "Accept",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Fetch failed" },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
