import { NextRequest, NextResponse } from "next/server";

// Cache trên server 2 phút
export const revalidate = 120;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const urlParam = searchParams.get("url");

  if (!urlParam) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Chỉ cho phép gọi tới phimapi.com để tránh SSRF
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
      next: { revalidate: 120 }, // Next.js Data Cache 2 phút
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PhimanhBot/1.0)",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}
