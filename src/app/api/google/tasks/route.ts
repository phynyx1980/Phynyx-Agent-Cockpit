import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTasks } from "@/lib/integrations/tasks";

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const tasks = await getTasks(session.accessToken, 20);
    return NextResponse.json({ success: true, data: tasks });
  } catch (err) {
    console.error("Tasks API error:", err);
    return NextResponse.json({ error: "Tasks-Fehler" }, { status: 502 });
  }
}
