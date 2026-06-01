import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = createServerClient();
  // CASCADE löscht automatisch alle chat_messages dieser Session
  const { error } = await db.from("chat_sessions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Löschen fehlgeschlagen" }, { status: 500 });
  return NextResponse.json({ success: true });
}
