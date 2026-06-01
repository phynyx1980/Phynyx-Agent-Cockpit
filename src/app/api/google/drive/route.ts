import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRecentFiles, searchFiles } from "@/lib/integrations/drive";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q");

  try {
    const files = q
      ? await searchFiles(req.nextUrl.searchParams.get("q")!.trim(), session.accessToken, 10)
      : await getRecentFiles(session.accessToken, 15);
    return NextResponse.json({ success: true, data: files });
  } catch (err) {
    console.error("Drive API error:", err);
    return NextResponse.json({ error: "Drive-Fehler", details: String(err) }, { status: 502 });
  }
}
