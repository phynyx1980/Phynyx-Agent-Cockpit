import type {
  AgentTask,
  AgentResult,
  Approval,
  WorkflowLog,
  JarvisResponse,
  Intent,
} from "./agent-types";
import { detectIntent } from "./intent-router";
import { getHandoffEntry, getAllAgentsForIntent } from "./handoff-matrix";
import { getAgentById } from "./agent-registry";
import { getMockResponse } from "@/lib/mock-data/agent-responses";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function now(): string {
  return new Date().toISOString();
}

function buildJarvisSummary(
  intent: Intent,
  agentIds: string[],
  results: AgentResult[],
  requiresApproval: boolean
): string {
  const agentNames = agentIds
    .map((id) => getAgentById(id)?.name ?? id)
    .join(", ");

  const successCount = results.filter((r) => r.status === "done").length;
  const riskCount = results.reduce((acc, r) => acc + r.risks.length, 0);

  const lines = [
    `Aufgabe erkannt als **${intent.replace(/_/g, " ")}**.`,
    `Ich habe ${agentIds.length} Agenten aktiviert: **${agentNames}**.`,
    `${successCount} von ${results.length} Agenten haben ihre Analyse abgeschlossen.`,
  ];

  if (riskCount > 0) {
    lines.push(`⚠️ ${riskCount} Risiko-Hinweis${riskCount > 1 ? "e" : ""} wurden markiert.`);
  }

  if (requiresApproval) {
    lines.push("🔒 Diese Aktion ist **freigabepflichtig** — ich habe eine Freigabe-Anfrage vorbereitet.");
  } else {
    lines.push("✅ Kein Freigabe-Schritt erforderlich.");
  }

  return lines.join(" ");
}

export function runJarvisOrchestrator(userMessage: string): JarvisResponse {
  const taskId = generateId();
  const logs: WorkflowLog[] = [];

  // 1. Intent erkennen
  const route = detectIntent(userMessage);
  const { intent } = route;
  const handoff = getHandoffEntry(intent);

  logs.push({
    id: generateId(),
    taskId,
    eventType: "task_created",
    message: `Neue Aufgabe erkannt: Intent "${intent}"`,
    createdAt: now(),
  });

  // 2. Alle beteiligten Agenten ermitteln
  const agentIds = getAllAgentsForIntent(intent);

  // 3. Task anlegen
  const task: AgentTask = {
    id: taskId,
    source: "user",
    userMessage,
    intent,
    assignedAgents: agentIds,
    status: "in_progress",
    priority: handoff.priority,
    requiresApproval: handoff.requiresApproval,
    createdAt: now(),
    updatedAt: now(),
  };

  // 4. Agenten aktivieren und Mock-Ergebnisse abrufen
  const results: AgentResult[] = [];

  for (const agentId of agentIds) {
    const agent = getAgentById(agentId);
    if (!agent || !agent.enabled) continue;

    logs.push({
      id: generateId(),
      taskId,
      eventType: "agent_activated",
      agentId,
      message: `${agent.name} wurde aktiviert`,
      createdAt: now(),
    });

    const mockResponse = getMockResponse(intent, agentId);

    const result: AgentResult = {
      id: generateId(),
      taskId,
      agentId,
      status: "done",
      summary: mockResponse.summary,
      details: mockResponse.details,
      suggestedActions: mockResponse.suggestedActions,
      risks: mockResponse.risks,
      createdAt: now(),
    };

    results.push(result);

    logs.push({
      id: generateId(),
      taskId,
      eventType: "agent_result",
      agentId,
      message: `${agent.name}: ${mockResponse.summary}`,
      createdAt: now(),
    });
  }

  // 5. Freigabe vorbereiten falls nötig
  const approvals: Approval[] = [];

  if (handoff.requiresApproval) {
    const approval: Approval = {
      id: generateId(),
      taskId,
      title: `Freigabe erforderlich: ${intent.replace(/_/g, " ")}`,
      description:
        handoff.approvalReason ?? "Diese Aktion erfordert deine Freigabe.",
      actionType: getActionTypeForIntent(intent),
      riskLevel: handoff.priority === "urgent" ? "critical" : handoff.priority === "high" ? "high" : "medium",
      status: "open",
      involvedAgents: agentIds,
      createdAt: now(),
    };

    approvals.push(approval);

    logs.push({
      id: generateId(),
      taskId,
      eventType: "approval_requested",
      message: `Freigabe angefordert: ${approval.title}`,
      createdAt: now(),
    });
  }

  // 6. Nächste Schritte aus allen Agentenergebnissen sammeln
  const nextSteps = Array.from(
    new Set(results.flatMap((r) => r.suggestedActions).slice(0, 4))
  );

  // 7. Jarvis-Zusammenfassung
  const summary = buildJarvisSummary(intent, agentIds, results, handoff.requiresApproval);

  logs.push({
    id: generateId(),
    taskId,
    eventType: "task_completed",
    message: "Jarvis hat alle Ergebnisse zusammengeführt",
    createdAt: now(),
  });

  return {
    taskId,
    intent,
    activatedAgents: agentIds,
    summary,
    results,
    approvalRequired: handoff.requiresApproval,
    approvals,
    logs,
    nextSteps,
  };
}

function getActionTypeForIntent(intent: Intent): Approval["actionType"] {
  const map: Partial<Record<Intent, Approval["actionType"]>> = {
    create_offer:          "send_offer",
    write_communication:   "send_email",
    create_social_post:    "post_social",
    voice_interface:       "friday_integration",
  };
  return map[intent] ?? "trigger_external_api";
}
