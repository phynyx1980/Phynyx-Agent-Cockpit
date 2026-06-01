import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRecentFiles } from "@/lib/integrations/drive";

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const files = await getRecentFiles(session.accessToken, 10);
    return NextResponse.json({ success: true, data: files });
  } catch (err) {
    console.error("Drive API error:", err);
    return NextResponse.json({ error: "Drive-Fehler" }, { status: 502 });
  }
}
