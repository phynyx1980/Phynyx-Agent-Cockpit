import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFolderContents, searchFiles, getFileName } from "@/lib/integrations/drive";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const q        = searchParams.get("q");
  const folderId = searchParams.get("folderId") ?? "root";

  try {
    if (q) {
      const files = await searchFiles(session.accessToken, q.trim(), 15);
      return NextResponse.json({ success: true, data: files, folderName: null });
    }

    const [files, folderName] = await Promise.all([
      getFolderContents(session.accessToken, folderId),
      folderId !== "root" ? getFileName(session.accessToken, folderId) : Promise.resolve("Mein Drive"),
    ]);

    return NextResponse.json({ success: true, data: files, folderName });
  } catch (err) {
    console.error("Drive API error:", err);
    return NextResponse.json({ error: "Drive-Fehler", details: String(err) }, { status: 502 });
  }
}
