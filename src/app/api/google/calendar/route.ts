import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUpcomingEvents } from "@/lib/integrations/calendar";

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const events = await getUpcomingEvents(session.accessToken, 10);
    return NextResponse.json({ success: true, data: events });
  } catch (err) {
    console.error("Calendar API error:", err);
    return NextResponse.json({ error: "Calendar-Fehler" }, { status: 502 });
  }
}
