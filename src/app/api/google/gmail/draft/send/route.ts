import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendDraft } from "@/lib/integrations/gmail";

// Entwurf senden — NUR nach expliziter Freigabe durch Philip aufrufen
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const { draftId } = await req.json().catch(() => ({}));
  if (!draftId) return NextResponse.json({ error: "draftId fehlt" }, { status: 400 });

  try {
    await sendDraft(session.accessToken, draftId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Draft send error:", err);
    return NextResponse.json({ error: "Senden fehlgeschlagen" }, { status: 502 });
  }
}
