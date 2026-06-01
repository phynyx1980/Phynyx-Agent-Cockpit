import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMessages, saveMessage } from "@/lib/supabase/chat-queries";

const SaveSchema = z.object({
  sessionId:  z.string().uuid(),
  role:       z.enum(["user", "jarvis"]),
  content:    z.string().min(1),
  jarvisData: z.unknown().optional(),
  googleData: z.unknown().optional(),
});

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId fehlt" }, { status: 400 });
  const messages = await getMessages(sessionId);
  return NextResponse.json({ success: true, data: messages });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const { sessionId, role, content, jarvisData, googleData } = parsed.data;
  const id = await saveMessage(sessionId, role, content, jarvisData, googleData);
  if (!id) return NextResponse.json({ error: "Speichern fehlgeschlagen" }, { status: 500 });
  return NextResponse.json({ success: true, id });
}
