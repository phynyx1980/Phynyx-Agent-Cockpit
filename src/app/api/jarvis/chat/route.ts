import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { AGENT_REGISTRY } from "@/lib/agents/agent-registry";
import { auth } from "@/auth";
import { getInbox } from "@/lib/integrations/gmail";
import { getUpcomingEvents } from "@/lib/integrations/calendar";
import { getTasks as getGoogleTasks } from "@/lib/integrations/tasks";
import { getFolderContents } from "@/lib/integrations/drive";
import type { GmailMessage } from "@/lib/integrations/gmail";
import type { CalendarEvent } from "@/lib/integrations/calendar";
import type { GoogleTask } from "@/lib/integrations/tasks";
import type { DriveFile } from "@/lib/integrations/drive";
import { createTask, createApproval, createLog } from "@/lib/supabase/queries";
import type { Approval, Intent } from "@/lib/agents/agent-types";
import PHYNYX_KNOWLEDGE from "@/lib/knowledge/phynyx-knowledge";

// ── Zod Validation ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  message:         z.string().min(1).max(2000),
  intent:          z.string().min(1),
  activatedAgents: z.array(z.string()).min(1).max(14),
});

// ── Google Intents ────────────────────────────────────────────────────────────

const GOOGLE_INTENTS = new Set([
  "gmail_query", "gmail_reply",
  "calendar_query", "tasks_query", "drive_query",
]);

// ── Google Kontext-Block für den Prompt ───────────────────────────────────────

function buildGoogleContextBlock(
  intent: string,
  data: { gmail?: GmailMessage[]; calendar?: CalendarEvent[]; tasks?: GoogleTask[]; drive?: DriveFile[] }
): string {
  const blocks: string[] = [];

  if ((intent === "gmail_query" || intent === "gmail_reply") && data.gmail?.length) {
    blocks.push(`<gmail_data count="${data.gmail.length}">
${data.gmail.map((m, i) =>
  `Mail ${i + 1}: [${m.unread ? "UNGELESEN" : "GELESEN"}]
  Von: ${m.from}
  Betreff: ${m.subject}
  Vorschau: ${m.snippet}`
).join("\n---\n")}
</gmail_data>`);
  }

  if (intent === "calendar_query" && data.calendar?.length) {
    blocks.push(`<calendar_data count="${data.calendar.length}">
${data.calendar.map((e, i) =>
  `Termin ${i + 1}: ${e.title}
  Start: ${new Date(e.start).toLocaleString("de-AT")}
  Ende: ${new Date(e.end).toLocaleString("de-AT")}${e.location ? `\n  Ort: ${e.location}` : ""}`
).join("\n---\n")}
</calendar_data>`);
  }

  if (intent === "tasks_query" && data.tasks?.length) {
    blocks.push(`<tasks_data count="${data.tasks.length}">
${data.tasks.filter(t => !t.completed).map((t, i) =>
  `Task ${i + 1}: ${t.title}${t.due ? ` (fällig: ${t.due})` : ""}${t.notes ? `\n  Notiz: ${t.notes}` : ""}`
).join("\n")}
</tasks_data>`);
  }

  if (intent === "drive_query" && data.drive?.length) {
    blocks.push(`<drive_data count="${data.drive.length}">
${data.drive.map((f, i) =>
  `${i + 1}: ${f.isFolder ? "📁" : "📄"} ${f.name} (${f.friendlyType})`
).join("\n")}
</drive_data>`);
  }

  if (!blocks.length) return "";
  return `\n\n## ECHTE GOOGLE-DATEN — JETZT AKTIV NUTZEN\n${blocks.join("\n\n")}`;
}

// ── NEXUS System-Prompt ───────────────────────────────────────────────────────

function buildSystemPrompt(intent: string, agentIds: string[], googleContext: string): string {
  const agentDescriptions = agentIds
    .map((id) => {
      const a = AGENT_REGISTRY.find((x) => x.id === id);
      return a ? `${a.emoji} ${a.name}: ${a.corePurpose}` : `${id}: Spezialist`;
    })
    .join("\n");

  return `Du bist JARVIS, der Orchestrator von Phynyx Trust Solutions — einer KI-Agentur für österreichische KMU. Dein CEO ist Philip Trost. Du koordinierst spezialisierte Sub-Agenten und lieferst immer konkreten, direkt nutzbaren Output.
${PHYNYX_KNOWLEDGE}
## Aktive Agenten für diese Anfrage
${agentDescriptions}

## Agentenverhalten (VERBINDLICH)
- LINA: Schreibt fertige Textentwürfe — E-Mails, Posts, Nachrichten. Fasst Gmail-Daten mit echten Betreffzeilen zusammen.
- VEGA: Kalkuliert reale Preise mit Zahlen, erstellt Angebotsstrukturen.
- NOVA: Gibt klare strategische Empfehlungen mit Priorisierung.
- NOX: Benennt konkrete Schwachstellen — niemals abstrakte Warnungen.
- KIRA: Zitiert konkrete Artikel (DSGVO Art. X), gibt umsetzbare Empfehlungen.
- JENNY: Erstellt Timelines mit echten Meilensteinen.
- ATLAS: Liefert Fakten, keine Vermutungen.
- SOREN: Beschreibt Workflow-Schritte konkret.
- FINN: Rechnet Kosten und Margen mit echten Zahlen.

## ERKANNTER INTENT: ${intent}

## ABSOLUTE VERBOTE
- NIEMALS "unklare Anfrage" als Risiko
- NIEMALS "Zugriff nicht möglich" wenn Daten vorhanden sind
- NIEMALS leere oder generische Antworten
- risks[]: NUR bei echten spezifischen Risiken befüllen — sonst immer []
- details ist IMMER der echte, fertige Inhalt — kein Meta-Kommentar${googleContext}

## OUTPUT — NUR dieses JSON, kein Text davor/danach:
{
  "summary": "2-3 Sätze: Was wurde geliefert, welche Agenten aktiv, Kernresultat",
  "agentResults": [
    {
      "agentId": "lina",
      "summary": "Was konkret geliefert wurde",
      "details": "Der fertige Inhalt — Text, Zahlen, Empfehlung. Kein Meta-Kommentar.",
      "suggestedActions": ["Konkrete nächste Aktion"],
      "risks": []
    }
  ],
  "nextSteps": ["Schritt 1", "Schritt 2"],
  "requiresApproval": false
}`;
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("sk-...")) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const validated = RequestSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Validation failed", details: validated.error.issues }, { status: 400 });
  }

  const { message, intent, activatedAgents } = validated.data;

  // ── Google-Daten serverseitig holen ─────────────────────────────────────────
  let googleContext = "";
  let googleData: { gmail?: GmailMessage[]; calendar?: CalendarEvent[]; tasks?: GoogleTask[]; drive?: DriveFile[] } = {};

  if (GOOGLE_INTENTS.has(intent)) {
    const session = await auth();
    if (session?.accessToken) {
      try {
        const [gmail, calendar, tasks, drive] = await Promise.allSettled([
          (intent === "gmail_query" || intent === "gmail_reply") ? getInbox(session.accessToken, 10) : Promise.resolve([]),
          intent === "calendar_query" ? getUpcomingEvents(session.accessToken, 10) : Promise.resolve([]),
          intent === "tasks_query" ? getGoogleTasks(session.accessToken, 15) : Promise.resolve([]),
          intent === "drive_query" ? getFolderContents(session.accessToken, "root", 10) : Promise.resolve([]),
        ]);

        googleData = {
          gmail:    gmail.status    === "fulfilled" ? gmail.value    as GmailMessage[]  : [],
          calendar: calendar.status === "fulfilled" ? calendar.value as CalendarEvent[] : [],
          tasks:    tasks.status    === "fulfilled" ? tasks.value    as GoogleTask[]    : [],
          drive:    drive.status    === "fulfilled" ? drive.value    as DriveFile[]     : [],
        };
        googleContext = buildGoogleContextBlock(intent, googleData);
      } catch (e) {
        console.error("Google data fetch error:", e);
      }
    } else {
      // Kein Google-Token — Hinweis in den Prompt
      googleContext = "\n\n## HINWEIS: Kein Google-Account verbunden. Nutzer soll Integrationen-Seite besuchen.";
    }
  }

  // ── OpenAI Call ──────────────────────────────────────────────────────────────
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await client.chat.completions.create({
      model:           "gpt-4o-mini",
      temperature:     0.6,
      max_tokens:      2000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(intent, activatedAgents, googleContext) },
        { role: "user",   content: message },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    let result: {
      summary: string;
      agentResults: Array<{ agentId: string; summary: string; details: string; suggestedActions: string[]; risks: string[] }>;
      nextSteps: string[];
      requiresApproval: boolean;
    };

    try { result = JSON.parse(raw); }
    catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    // ── In Supabase speichern ──────────────────────────────────────────────────
    const savedTask = await createTask({
      source:           "user",
      userMessage:      message,
      intent:           intent as Intent,
      assignedAgents:   activatedAgents,
      status:           result.requiresApproval ? "awaiting_approval" : "completed",
      priority:         "medium",
      resultSummary:    result.summary,
      requiresApproval: result.requiresApproval ?? false,
    });

    if (savedTask) {
      await createLog({ taskId: savedTask.id, eventType: "task_created", message: `Task: ${intent}` });
      for (const agentId of activatedAgents) {
        await createLog({ taskId: savedTask.id, eventType: "agent_activated", agentId, message: `${agentId} aktiviert` });
      }
      await createLog({ taskId: savedTask.id, eventType: "task_completed", message: result.summary.slice(0, 200) });

      if (result.requiresApproval) {
        const approval: Omit<Approval, "id" | "createdAt"> = {
          taskId: savedTask.id,
          title: `Freigabe: ${intent.replace(/_/g, " ")}`,
          description: "Freigabe durch Jarvis angefordert",
          actionType: "trigger_external_api",
          riskLevel: "high",
          status: "open",
          involvedAgents: activatedAgents,
        };
        await createApproval(approval);
      }
    }

    return NextResponse.json({
      success:    true,
      data:       result,
      googleData,             // Raw Google-Daten für Rich-Display im Chat
      taskId:     savedTask?.id,
    });

  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      return NextResponse.json({ error: "AI service unavailable", details: err.message }, { status: 502 });
    }
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
