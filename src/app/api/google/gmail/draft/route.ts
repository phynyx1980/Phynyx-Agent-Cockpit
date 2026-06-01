import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createDraft } from "@/lib/integrations/gmail";

const Schema = z.object({
  to:      z.string().email(),
  subject: z.string().min(1),
  body:    z.string().min(1),
});

// Entwurf in Gmail anlegen — KEIN Versand
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  try {
    const draft = await createDraft(session.accessToken, parsed.data.to, parsed.data.subject, parsed.data.body);
    return NextResponse.json({ success: true, data: draft });
  } catch (err) {
    console.error("Draft create error:", err);
    return NextResponse.json({ error: "Draft konnte nicht erstellt werden" }, { status: 502 });
  }
}
