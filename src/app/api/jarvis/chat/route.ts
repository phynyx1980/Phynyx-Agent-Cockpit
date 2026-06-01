import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { AGENT_REGISTRY } from "@/lib/agents/agent-registry";

// ── Zod Validation (ELIAS) ────────────────────────────────────────────────────

const RequestSchema = z.object({
  message:         z.string().min(1).max(2000),
  intent:          z.string().min(1),
  activatedAgents: z.array(z.string()).min(1).max(14),
});

// ── NEXUS System-Prompt ───────────────────────────────────────────────────────

function buildSystemPrompt(intent: string, agentIds: string[]): string {
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
- Priorisiere Geschwindigkeit und Umsetzbarkeit

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
  // 1. API Key prüfen
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("sk-...")) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  // 2. Request validieren
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { message, intent, activatedAgents } = parsed.data;

  // 3. OpenAI aufrufen
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await client.chat.completions.create({
      model:           "gpt-4o-mini",
      temperature:     0.7,
      max_tokens:      1500,
      response_format: { type: "json_object" },
      messages: [
        {
          role:    "system",
          content: buildSystemPrompt(intent, activatedAgents),
        },
        {
          role:    "user",
          content: message,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    // 4. JSON parsen
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: parsed });

  } catch (err) {
    // OpenAI API Fehler
    if (err instanceof OpenAI.APIError) {
      console.error("OpenAI API Error:", err.status, err.message);
      return NextResponse.json(
        { error: "AI service unavailable", details: err.message },
        { status: 502 }
      );
    }

    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
