import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { sendDraft } from "@/lib/integrations/gmail";
import { createEvent } from "@/lib/integrations/calendar";
import type { ApprovalPayload } from "@/lib/agents/agent-types";

type Ctx = { params: Promise<{ id: string }> };

const Schema = z.object({
  action: z.enum(["approve", "reject", "defer"]),
});

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const { action } = parsed.data;
  const db = createServerClient();

  // Approval laden inkl. payload
  const { data: approval, error: fetchErr } = await db
    .from("approvals")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !approval) {
    return NextResponse.json({ error: "Approval nicht gefunden" }, { status: 404 });
  }

  const newStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "deferred";

  // Status aktualisieren
  const { error: updateErr } = await db
    .from("approvals")
    .update({
      status:      newStatus,
      approved_at: action === "approve" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: "Status-Update fehlgeschlagen" }, { status: 500 });
  }

  // Bei Freigabe: Aktion ausführen
  let executionResult: { type: string; message: string; data?: unknown } | null = null;

  if (action === "approve" && approval.payload) {
    const payload = approval.payload as ApprovalPayload;
    const session = await auth();

    try {
      if (payload.type === "email" && payload.draftId && session?.accessToken) {
        // Gmail-Entwurf senden
        await sendDraft(session.accessToken, payload.draftId);
        executionResult = { type: "email_sent", message: `E-Mail an ${payload.to} wurde gesendet.` };

      } else if (payload.type === "calendar" && payload.calendarData && session?.accessToken) {
        // Kalender-Eintrag erstellen
        const event = await createEvent(
          session.accessToken,
          payload.calendarData.title,
          payload.calendarData.start,
          payload.calendarData.end,
          payload.calendarData.description,
        );
        executionResult = { type: "calendar_created", message: `Termin "${event.title}" wurde erstellt.`, data: event };

      } else if (payload.type === "offer_pdf") {
        // PDF-Daten zurückgeben — Client generiert PDF
        executionResult = { type: "offer_pdf", message: "Angebot bereit zum Download.", data: payload };
      } else {
        executionResult = { type: "approved", message: "Freigabe erteilt." };
      }
    } catch (err) {
      console.error("Execution error:", err);
      executionResult = { type: "error", message: "Ausführung fehlgeschlagen — bitte manuell prüfen." };
    }
  }

  return NextResponse.json({
    success: true,
    status:  newStatus,
    execution: executionResult,
  });
}
