import type { AgentProfile, AgentTask, Approval, RiskLevel } from "@/lib/agents/agent-types";
import { AGENT_REGISTRY } from "@/lib/agents/agent-registry";

// ── Adapter-Interface (ORION) ─────────────────────────────────────────────────

export interface DashboardDataSource {
  getAgents:    () => AgentProfile[];
  getTasks:     () => AgentTask[];
  getApprovals: () => Approval[];
}

// Synchrone Quelle für Server Components (Daten werden vorher geladen)
export function buildDataSource(tasks: AgentTask[], approvals: Approval[]): DashboardDataSource {
  return {
    getAgents:    () => AGENT_REGISTRY,
    getTasks:     () => tasks,
    getApprovals: () => approvals,
  };
}

// ── Stats-Typen ───────────────────────────────────────────────────────────────

export interface AgentStats {
  total:    number;
  active:   number;
  busy:     number;
  inactive: number;
}

export interface TaskStats {
  total:      number;
  inProgress: number;
  pending:    number;
  completed:  number;
  failed:     number;
  urgent:     number;
}

export interface ApprovalStats {
  total:    number;
  open:     number;
  critical: number;
  high:     number;
}

// ── Aggregations-Funktionen ───────────────────────────────────────────────────

export function getAgentStats(agents: AgentProfile[]): AgentStats {
  return {
    total:    agents.length,
    active:   agents.filter((a) => a.status === "active").length,
    busy:     agents.filter((a) => a.status === "busy").length,
    inactive: agents.filter((a) => a.status === "inactive" || a.status === "standby").length,
  };
}

export function getTaskStats(tasks: AgentTask[]): TaskStats {
  return {
    total:      tasks.length,
    inProgress: tasks.filter((t) => t.status === "in_progress" || t.status === "routing").length,
    pending:    tasks.filter((t) => t.status === "pending" || t.status === "awaiting_approval").length,
    completed:  tasks.filter((t) => t.status === "completed").length,
    failed:     tasks.filter((t) => t.status === "failed" || t.status === "cancelled").length,
    urgent:     tasks.filter((t) => t.priority === "urgent").length,
  };
}

export function getApprovalStats(approvals: Approval[]): ApprovalStats {
  return {
    total:    approvals.length,
    open:     approvals.filter((a) => a.status === "open" || a.status === "revised").length,
    critical: approvals.filter((a) => a.riskLevel === "critical").length,
    high:     approvals.filter((a) => a.riskLevel === "high").length,
  };
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

export type ActivitySource    = "task" | "approval";
export type ActivityEventType =
  | "task_created"
  | "task_completed"
  | "task_failed"
  | "approval_requested"
  | "approval_resolved";

export interface ActivityFeedItem {
  id:             string;
  source:         ActivitySource;
  eventType:      ActivityEventType;
  title:          string;
  involvedAgents: string[];
  riskLevel?:     RiskLevel;
  timestamp:      string;
  href?:          string;
}

export function getRecentActivity(
  tasks: AgentTask[],
  approvals: Approval[],
  limit = 20,
): ActivityFeedItem[] {
  const items: ActivityFeedItem[] = [];

  for (const task of tasks) {
    if (task.status === "in_progress" || task.status === "routing") {
      items.push({
        id:             `task-active-${task.id}`,
        source:         "task",
        eventType:      "task_created",
        title:          task.userMessage,
        involvedAgents: task.assignedAgents,
        timestamp:      task.updatedAt,
        href:           "/workflows",
      });
    }
    if (task.status === "completed") {
      items.push({
        id:             `task-done-${task.id}`,
        source:         "task",
        eventType:      "task_completed",
        title:          task.resultSummary ?? task.userMessage,
        involvedAgents: task.assignedAgents,
        timestamp:      task.updatedAt,
        href:           "/workflows",
      });
    }
    if (task.status === "failed" || task.status === "cancelled") {
      items.push({
        id:             `task-failed-${task.id}`,
        source:         "task",
        eventType:      "task_failed",
        title:          task.userMessage,
        involvedAgents: task.assignedAgents,
        timestamp:      task.updatedAt,
        href:           "/workflows",
      });
    }
  }

  for (const approval of approvals) {
    items.push({
      id:             `apr-req-${approval.id}`,
      source:         "approval",
      eventType:      "approval_requested",
      title:          approval.title,
      involvedAgents: approval.involvedAgents,
      riskLevel:      approval.riskLevel,
      timestamp:      approval.createdAt,
      href:           "/approvals",
    });
    if (approval.status !== "open" && approval.status !== "revised") {
      items.push({
        id:             `apr-res-${approval.id}`,
        source:         "approval",
        eventType:      "approval_resolved",
        title:          `${approval.title} — ${approval.status === "approved" ? "Genehmigt" : approval.status === "rejected" ? "Abgelehnt" : "Zurückgestellt"}`,
        involvedAgents: approval.involvedAgents,
        riskLevel:      approval.riskLevel,
        timestamp:      approval.approvedAt ?? approval.createdAt,
        href:           "/approvals",
      });
    }
  }

  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
