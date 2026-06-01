import type { Intent } from "./agent-types";

interface IntentRoute {
  intent: Intent;
  primaryAgent: string;
  supportingAgents: string[];
  keywords: string[];
  requiresApproval: boolean;
}

export const INTENT_ROUTES: IntentRoute[] = [
  {
    intent: "general_question",
    primaryAgent: "jarvis",
    supportingAgents: [],
    keywords: ["was ist", "erkläre", "hilf mir", "wie funktioniert", "frage", "info"],
    requiresApproval: false,
  },
  {
    intent: "customer_inquiry",
    primaryAgent: "nova",
    supportingAgents: ["vega", "lina"],
    keywords: ["kundenanfrage", "kunde", "interessent", "lead", "kontakt", "anfrage"],
    requiresApproval: false,
  },
  {
    intent: "create_offer",
    primaryAgent: "vega",
    supportingAgents: ["lina", "kira", "nox"],
    keywords: ["angebot", "offerte", "preis", "paket", "kalkulation", "erstelle ein angebot"],
    requiresApproval: true,
  },
  {
    intent: "sales_strategy",
    primaryAgent: "vega",
    supportingAgents: ["lina", "jarvis"],
    keywords: ["verkauf", "sales", "strategie", "abschluss", "closing", "einwand", "pipeline"],
    requiresApproval: false,
  },
  {
    intent: "write_communication",
    primaryAgent: "lina",
    supportingAgents: ["jarvis"],
    keywords: ["schreib", "mail", "email", "nachricht", "kommunikation", "text", "follow-up", "antwort"],
    requiresApproval: true,
  },
  {
    intent: "plan_content",
    primaryAgent: "elara",
    supportingAgents: ["orion", "lina", "vega", "kira", "nox"],
    keywords: ["content", "plan", "redaktionsplan", "contentplan", "themen", "beiträge", "nächste woche"],
    requiresApproval: false,
  },
  {
    intent: "create_social_post",
    primaryAgent: "elara",
    supportingAgents: ["lina", "orion", "kira", "nox"],
    keywords: ["post", "linkedin", "instagram", "social media", "beitrag", "veröffentliche", "poste"],
    requiresApproval: true,
  },
  {
    intent: "technical_issue",
    primaryAgent: "soren",
    supportingAgents: ["atlas", "nox", "forge"],
    keywords: ["problem", "fehler", "bug", "api", "technisch", "funktioniert nicht", "crash", "error", "issue"],
    requiresApproval: false,
  },
  {
    intent: "system_concept",
    primaryAgent: "atlas",
    supportingAgents: ["jarvis", "nox", "kira"],
    keywords: ["system", "konzept", "workflow", "prozess", "struktur", "architektur", "logik"],
    requiresApproval: false,
  },
  {
    intent: "compliance_check",
    primaryAgent: "kira",
    supportingAgents: ["nox", "jarvis"],
    keywords: ["dsgvo", "datenschutz", "compliance", "impressum", "agb", "recht", "lizenz", "risiko"],
    requiresApproval: false,
  },
  {
    intent: "security_qa_check",
    primaryAgent: "nox",
    supportingAgents: ["kira", "atlas", "soren"],
    keywords: ["security", "sicherheit", "qa", "test", "prüf", "risik", "go-live", "checklist"],
    requiresApproval: false,
  },
  {
    intent: "academy_learning",
    primaryAgent: "milo",
    supportingAgents: ["atlas", "lina", "elara"],
    keywords: ["academy", "kurs", "lernen", "schulung", "training", "lernpfad", "weiterbildung"],
    requiresApproval: false,
  },
  {
    intent: "developer_briefing",
    primaryAgent: "forge",
    supportingAgents: ["soren", "atlas", "nox"],
    keywords: ["developer", "entwickler", "code", "briefing", "claude code", "prompt", "implementier"],
    requiresApproval: false,
  },
  {
    intent: "voice_interface",
    primaryAgent: "echo",
    supportingAgents: ["atlas", "soren"],
    keywords: ["voice", "sprache", "sprachsteuerung", "friday", "integration", "stimme"],
    requiresApproval: true,
  },
  {
    intent: "show_agents",
    primaryAgent: "jarvis",
    supportingAgents: [],
    keywords: ["zeig mir", "agenten", "agententeam", "team", "wer sind", "alle agenten"],
    requiresApproval: false,
  },
  {
    intent: "show_approvals",
    primaryAgent: "jarvis",
    supportingAgents: [],
    keywords: ["freigaben", "offene freigaben", "approval", "genehmigung", "was muss ich freigeben"],
    requiresApproval: false,
  },
  {
    intent: "show_tasks",
    primaryAgent: "jarvis",
    supportingAgents: [],
    keywords: ["aufgaben", "tasks", "offene aufgaben", "was läuft", "status", "übersicht"],
    requiresApproval: false,
  },
];

export function detectIntent(message: string): IntentRoute {
  const lower = message.toLowerCase();

  let bestMatch: IntentRoute | null = null;
  let bestScore = 0;

  for (const route of INTENT_ROUTES) {
    let score = 0;
    for (const keyword of route.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.split(" ").length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = route;
    }
  }

  return bestMatch ?? INTENT_ROUTES[0];
}

export function getRouteForIntent(intent: Intent): IntentRoute {
  return (
    INTENT_ROUTES.find((r) => r.intent === intent) ?? INTENT_ROUTES[0]
  );
}
