import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { AGENT_REGISTRY } from "@/lib/agents/agent-registry";
import { auth } from "@/auth";
import { getInbox } from "@/lib/integrations/gmail";
import { getUpcomingEvents } from "@/lib/integrations/calendar";
import { getTasks as getGoogleTasks } from "@/lib/integrations/tasks";
import type { Intent } from "@/lib/agents/agent-types";
import { getFolderContents } from "@/lib/integrations/drive";
import type { GmailMessage } from "@/lib/integrations/gmail";
import type { CalendarEvent } from "@/lib/integrations/calendar";
import type { GoogleTask } from "@/lib/integrations/tasks";
import type { DriveFile } from "@/lib/integrations/drive";
import { createTask, createApproval, createLog } from "@/lib/supabase/queries";
import type { Approval } from "@/lib/agents/agent-types";

// ── Zod Validation ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  message:         z.string().min(1).max(2000),
  intent:          z.string().min(1),
  activatedAgents: z.array(z.string()).min(1).max(14),
});

// ── Google Intents die echte Daten brauchen ───────────────────────────────────

const GOOGLE_INTENTS = new Set([
  "gmail_query", "gmail_reply",
  "calendar_query", "tasks_query", "drive_query",
]);

// ── NEXUS Google-Kontext Block (XML-Tags für präzisere LLM-Verarbeitung) ──────

function buildGoogleContextBlock(
  intent: string,
  data: {
    gmail?:    GmailMessage[];
    calendar?: CalendarEvent[];
    tasks?:    GoogleTask[];
    drive?:    DriveFile[];
  }
): string {
  const blocks: string[] = [];

  if ((intent === "gmail_query" || intent === "gmail_reply") && data.gmail?.length) {
    blocks.push(`<gmail>
${data.gmail.map((m) =>
  `[${m.unread ? "UNREAD" : "READ"}] id:${m.id} | ${m.date} | from:${m.from}
subject: ${m.subject}
preview: ${m.snippet}`
).join("\n---\n")}
</gmail>`);
  }

  if (intent === "calendar_query" && data.calendar?.length) {
    blocks.push(`<calendar>
${data.calendar.map((e) =>
  `id:${e.id} | ${e.title} | ${e.start} → ${e.end}${e.location ? ` | @${e.location}` : ""}`
).join("\n")}
</calendar>`);
  }

  if (intent === "tasks_query" && data.tasks?.length) {
    blocks.push(`<tasks>
${data.tasks.map((t) =>
  `[${t.completed ? "DONE" : "OPEN"}] id:${t.id} | ${t.title}${t.due ? ` | due:${t.due}` : ""}${t.notes ? ` | note:${t.notes}` : ""}`
).join("\n")}
</tasks>`);
  }

  if (intent === "drive_query" && data.drive?.length) {
    blocks.push(`<drive>
${data.drive.map((f) =>
  `id:${f.id} | ${f.name} | ${f.mimeType} | modified:${f.modifiedTime}${f.webViewLink ? ` | ${f.webViewLink}` : ""}`
).join("\n")}
</drive>`);
  }

  if (!blocks.length) return "";

  return `\n\n## LIVE GOOGLE DATA — AKTIV NUTZEN
Die folgenden Daten wurden in Echtzeit abgerufen. Beziehe dich direkt darauf.
Sage NICHT "ich habe keinen Zugriff" — diese Daten SIND dein Zugriff.

${blocks.join("\n\n")}`;
}

// ── System-Prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(intent: string, agentIds: string[], googleContext: string): string {
  const agentDescriptions = agentIds
    .map((id) => {
      const agent = AGENT_REGISTRY.find((a) => a.id === id);
      if (!agent) return `${id}: Spezialist`;
      return `${agent.emoji} ${agent.name} (${agent.role}): ${agent.corePurpose}`;
    })
    .join("\n");

  return `Du bist JARVIS, der Master-Orchestrator von Phynyx Trust Solutions — einer österreichischen KI-Agentur für KMU, die Automatisierungen, Chatbots und Dashboards liefert. CEO ist Philip Trost.

Deine Aufgabe: Analysiere die Anfrage, koordiniere die aktivierten Sub-Agenten und liefere strukturierte, umsetzbare Ergebnisse auf Deutsch.

AKTIVIERTE AGENTEN FÜR DIESE ANFRAGE:
${agentDescriptions}

ERKANNTER INTENT: ${intent}

DEINE DIREKTIVEN:
- Antworte AUSSCHLIESSLICH auf Deutsch, direkt und unternehmerisch
- Analysiere die Anfrage aus der Perspektive JEDES aktivierten Agenten separat
- Liefere konkrete Empfehlungen — keine Floskeln, keine Worthülsen
- Erkenne, ob eine Aktion Philips explizite Freigabe benötigt (requiresApproval: true bei: E-Mail-Versand, Angebote über 5.000 EUR, irreversible Aktionen, Deployments)
- Priorisiere Geschwindigkeit und Umsetzbarkeit${googleContext}

OUTPUT-FORMAT — antworte NUR mit validem JSON, exakt nach dieser Struktur:
{
  "summary": "Jarvis Gesamtzusammenfassung in 2-4 Sätzen",
  "agentResults": [
    {
      "agentId": "agent_id_lowercase",
      "summary": "Kernaussage des Agenten in 1-2 Sätzen",
      "details": "Detaillierte Analyse mit konkreten Empfehlungen in 3-5 Sätzen",
      "suggestedActions": ["Konkrete Aktion 1", "Konkrete Aktion 2"],
      "risks": ["Risiko oder Blocker, falls vorhanden"]
    }
  ],
  "nextSteps": ["Priorisierter Schritt 1", "Schritt 2", "Schritt 3"],
  "requiresApproval": false
}

Liefere ausschließlich das JSON-Objekt — kein Text davor oder danach.`;
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("sk-...")) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = RequestSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Validation failed", details: validated.error.issues }, { status: 400 });
  }

  const { message, intent, activatedAgents } = validated.data;

  // Google-Daten serverseitig holen wenn nötig
  let googleContext = "";
  if (GOOGLE_INTENTS.has(intent)) {
    const session = await auth();
    if (session?.accessToken) {
      try {
        const [gmail, calendar, tasks, drive] = await Promise.allSettled([
          intent === "gmail_query" || intent === "gmail_reply"
            ? getInbox(session.accessToken, 8)
            : Promise.resolve([]),
          intent === "calendar_query"
            ? getUpcomingEvents(session.accessToken, 8)
            : Promise.resolve([]),
          intent === "tasks_query"
            ? getGoogleTasks(session.accessToken, 15)
            : Promise.resolve([]),
          intent === "drive_query"
            ? getRecentFiles(session.accessToken, 8)
            : Promise.resolve([]),
        ]);

        googleContext = buildGoogleContextBlock(intent, {
          gmail:    gmail.status    === "fulfilled" ? gmail.value    as GmailMessage[]  : [],
          calendar: calendar.status === "fulfilled" ? calendar.value as CalendarEvent[] : [],
          tasks:    tasks.status    === "fulfilled" ? tasks.value    as GoogleTask[]    : [],
          drive:    drive.status    === "fulfilled" ? drive.value    as DriveFile[]     : [],
        });
      } catch {
        // Kein Google-Kontext verfügbar — Jarvis antwortet trotzdem
      }
    }
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await client.chat.completions.create({
      model:           "gpt-4o-mini",
      temperature:     0.7,
      max_tokens:      1500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(intent, activatedAgents, googleContext) },
        { role: "user",   content: message },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    let result: {
      summary:          string;
      agentResults:     Array<{ agentId: string; summary: string; details: string; suggestedActions: string[]; risks: string[] }>;
      nextSteps:        string[];
      requiresApproval: boolean;
    };
    try {
      result = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // ── In Supabase persistieren ─────────────────────────────────────────────
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
      // Logs schreiben
      await createLog({ taskId: savedTask.id, eventType: "task_created",   message: `Task erstellt: ${intent}` });
      for (const agentId of activatedAgents) {
        await createLog({ taskId: savedTask.id, eventType: "agent_activated", agentId, message: `${agentId} aktiviert` });
      }
      await createLog({ taskId: savedTask.id, eventType: result.requiresApproval ? "task_completed" : "task_completed", message: result.summary.slice(0, 200) });

      // Approval anlegen falls nötig
      if (result.requiresApproval) {
        const handoffEntry = { approvalReason: "Freigabe durch Jarvis angefordert" };
        const approval: Omit<Approval, "id" | "createdAt"> = {
          taskId:         savedTask.id,
          title:          `Freigabe: ${intent.replace(/_/g, " ")}`,
          description:    handoffEntry.approvalReason,
          actionType:     "trigger_external_api",
          riskLevel:      "high",
          status:         "open",
          involvedAgents: activatedAgents,
        };
        await createApproval(approval);
        await createLog({ taskId: savedTask.id, eventType: "approval_requested", message: `Freigabe angefordert für: ${intent}` });
      }
    }

    return NextResponse.json({ success: true, data: result, taskId: savedTask?.id });

  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      console.error("OpenAI API Error:", err.status, err.message);
      return NextResponse.json({ error: "AI service unavailable", details: err.message }, { status: 502 });
    }
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
