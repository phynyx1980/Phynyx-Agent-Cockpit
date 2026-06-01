import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessions, createSession } from "@/lib/supabase/chat-queries";

export async function GET() {
  const sessions = await getSessions(30);
  return NextResponse.json({ success: true, data: sessions });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { title } = z.object({ title: z.string().min(1) }).parse(body);
  const session = await createSession(title);
  if (!session) return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  return NextResponse.json({ success: true, data: session });
}
