import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = createServerClient();
  const { error } = await db.from("agent_tasks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Löschen fehlgeschlagen" }, { status: 500 });
  return NextResponse.json({ success: true });
}
