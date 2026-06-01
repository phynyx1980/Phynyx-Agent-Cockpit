import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getInbox } from "@/lib/integrations/gmail";

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const messages = await getInbox(session.accessToken, 10);
    return NextResponse.json({ success: true, data: messages });
  } catch (err) {
    console.error("Gmail API error:", err);
    return NextResponse.json({ error: "Gmail-Fehler" }, { status: 502 });
  }
}
