import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createEvent } from "@/lib/integrations/calendar";

const Schema = z.object({
  title:       z.string().min(1),
  start:       z.string().min(1),
  end:         z.string().min(1),
  description: z.string().optional(),
  location:    z.string().optional(),
});

// Kalender-Event erstellen — NUR nach expliziter Freigabe durch Philip
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  try {
    const event = await createEvent(
      session.accessToken,
      parsed.data.title,
      parsed.data.start,
      parsed.data.end,
      parsed.data.description,
    );
    return NextResponse.json({ success: true, data: event });
  } catch (err) {
    console.error("Calendar create error:", err);
    return NextResponse.json({ error: "Event konnte nicht erstellt werden" }, { status: 502 });
  }
}
