import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getEmailDetail } from "@/lib/integrations/gmail";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { id } = await params;
  const mail = await getEmailDetail(session.accessToken, id);
  if (!mail) return NextResponse.json({ error: "Mail nicht gefunden" }, { status: 404 });

  return NextResponse.json({ success: true, data: mail });
}
