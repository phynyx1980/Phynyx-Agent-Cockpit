import type { Approval } from "@/lib/agents/agent-types";

export const MOCK_APPROVALS: Approval[] = [
  {
    id: "apr-001",
    taskId: "task-002",
    title: "Angebotsversand KI-Chatbot — Onlineshop",
    description:
      "Vega hat 3 Angebotspakete (1.500–8.500 EUR) vorbereitet. Lina hat den Angebotstext formuliert. Kira meldet einen Compliance-Hinweis (AGB-Verweis fehlt). Das Angebot ist freigabebereit sobald AGB ergänzt wurde.",
    actionType: "send_offer",
    riskLevel: "high",
    status: "open",
    involvedAgents: ["vega", "lina", "kira", "nox"],
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    notes: "Kira: AGB-Verweis muss noch ergänzt werden vor dem Versand.",
  },
  {
    id: "apr-002",
    taskId: "task-001",
    title: "Antwortmail an Kundenanfrage KMU Wien",
    description:
      "Lina hat eine professionelle Antwortmail formuliert. Nova hat den Lead als qualifiziert eingestuft. Vega empfiehlt Discovery-Call innerhalb 48h. Mail-Entwurf liegt bereit.",
    actionType: "send_email",
    riskLevel: "medium",
    status: "open",
    involvedAgents: ["lina", "nova", "vega"],
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "apr-003",
    taskId: "task-003",
    title: "LinkedIn-Post: KI-Automatisierung im Alltag",
    description:
      "Elara hat Contentplan erstellt. Lina hat Caption formuliert. Kira meldet: absoluter Claim 'spart garantiert Zeit' muss abgemildert werden. Nach Anpassung ist der Post freigabebereit.",
    actionType: "post_social",
    riskLevel: "medium",
    status: "revised",
    involvedAgents: ["elara", "lina", "kira", "nox"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    approvedAt: undefined,
    notes: "Kira: Claim angepasst. Bereit für erneute Prüfung.",
  },
  {
    id: "apr-004",
    taskId: "task-005",
    title: "Go-Live Landing Page — RLS-Fix erforderlich",
    description:
      "Nox hat kritisches Finding: Row Level Security in Supabase nicht aktiviert. Go-Live ist gesperrt bis RLS für alle Tabellen konfiguriert ist. Nach dem Fix Nox erneut beauftragen.",
    actionType: "trigger_external_api",
    riskLevel: "critical",
    status: "open",
    involvedAgents: ["nox", "kira", "atlas"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    notes: "Nox: Go/No-Go = NO GO. RLS muss zuerst aktiviert werden.",
  },
  {
    id: "apr-005",
    taskId: "task-006",
    title: "API-Integration deployen — Staging-Freigabe",
    description:
      "Forge hat Developer-Briefing abgeschlossen. Implementierung ist fertig. Nox hat QA-Check bestanden. Deployment auf Staging-Umgebung erfordert Freigabe.",
    actionType: "trigger_external_api",
    riskLevel: "medium",
    status: "approved",
    involvedAgents: ["forge", "nox", "soren"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
  },
];
