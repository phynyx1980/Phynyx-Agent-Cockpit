import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getEmailDetail, markAsRead, trashEmail } from "@/lib/integrations/gmail";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  const { id } = await params;
  const mail = await getEmailDetail(session.accessToken, id);
  if (!mail) return NextResponse.json({ error: "Mail nicht gefunden" }, { status: 404 });
  return NextResponse.json({ success: true, data: mail });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  const { id } = await params;
  const { action } = await req.json().catch(() => ({}));
  if (action === "markRead") {
    await markAsRead(session.accessToken, id);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  const { id } = await params;
  await trashEmail(session.accessToken, id);
  return NextResponse.json({ success: true });
}
